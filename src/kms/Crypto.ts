import * as crypto from "crypto";
import Future from "futurejs";
import {
    Base64String,
    EncryptedDocument,
    EncryptedDocumentWithEdek,
    EncryptedDocumentWithEdekCollection,
    PlaintextDocument,
    PlaintextDocumentCollection,
    PlaintextDocumentWithEdek,
    PlaintextDocumentWithEdekCollection,
} from "../../tenant-security-nodejs";
import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";
import {BatchUnwrapKeyResponse, BatchWrapKeyResponse} from "./KmsApi";

interface EncryptedDocumentParts {
    iv: Buffer;
    encryptedBytes: Buffer;
    gcmTag: Buffer;
}

export type BatchEncryptResult = TenantSecurityClientException | EncryptedDocumentWithEdek;
export type BatchDecryptResult = TenantSecurityClientException | PlaintextDocumentWithEdek;

const AES_ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 16;
//Current version of IronCore encrypted documents
const CURRENT_DOCUMENT_HEADER_VERSION = Buffer.from([3]);
//IRON in ascii. Used to better denote whether this is an IronCore encrypted document
const DOCUMENT_MAGIC = Buffer.from([73, 82, 79, 78]);
//Header byte length. CMK documents currently don't have any header data, so this is fixed to 0 for now.
const HEADER_PROTOBUF_CONTENT = Buffer.from([0, 0]);
// the size of the fixed length portion of the header
const DOCUMENT_HEADER_META_LENGTH = CURRENT_DOCUMENT_HEADER_VERSION.length + DOCUMENT_MAGIC.length + HEADER_PROTOBUF_CONTENT.length;

/**
 * Check that the given bytes contain the expected CMK header bytes
 */
const containsIroncoreMagic = (bytes: Buffer): boolean => bytes.length >= 5 && bytes.slice(1, 5).equals(DOCUMENT_MAGIC);

/**
 * Return the header bytes for all IronCore encrypted documents
 */
const generateHeader = (): Buffer => Buffer.concat([CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, HEADER_PROTOBUF_CONTENT]);

/**
 * Multiply the header size bytes at the 5th and 6th indices to get the header size. If those bytes don't exist this will throw.
 */
const getHeaderSize = (bytes: Buffer): number => bytes[5] * 256 + bytes[6];

/**
 * Deconstruct the provided encrypted document into it's component parts. Strips off the header and then slices off the IV on the
 * front and the GCM auth tag on the back.
 */
const parseEncryptedDocumentParts = (encryptedBytesWithHeader: Buffer): Future<TenantSecurityClientException, EncryptedDocumentParts> => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (!isCmkEncryptedDocument(encryptedBytesWithHeader)) {
        return Future.reject(new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document."));
    }
    //Slice off the header of the document which includes the fixed size header plus any metadata we put in the front of the document
    const encryptedBytes = encryptedBytesWithHeader.slice(getHeaderSize(encryptedBytesWithHeader) + DOCUMENT_HEADER_META_LENGTH);
    return Future.of({
        iv: encryptedBytes.slice(0, IV_BYTE_LENGTH),
        encryptedBytes: encryptedBytes.slice(IV_BYTE_LENGTH, encryptedBytes.length - AES_GCM_TAG_LENGTH),
        gcmTag: encryptedBytes.slice(encryptedBytes.length - AES_GCM_TAG_LENGTH),
    });
};

/**
 * Take the provided plaintext bytes, generate a new random IV, and encrypt the data with the provided key.
 */
const encryptField = (plaintextFieldBytes: Buffer, aesKey: Buffer): Future<TenantSecurityClientException, Buffer> =>
    Future.tryF(() => {
        const iv = crypto.randomBytes(IV_BYTE_LENGTH);
        const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);
        return Buffer.concat([generateHeader(), iv, cipher.update(plaintextFieldBytes), cipher.final(), cipher.getAuthTag()]);
    }).errorMap((e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_ENCRYPT_FAILED, e.message));

/**
 * Attempt to parse the provided encrypted field bytes as a CMK document and AES decrypt them with the provided key.
 */
const decryptField = ({iv, encryptedBytes, gcmTag}: EncryptedDocumentParts, aesKey: Buffer): Future<TenantSecurityClientException, Buffer> =>
    Future.tryF(() => {
        const cipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv);
        cipher.setAuthTag(gcmTag);
        return Buffer.concat([cipher.update(encryptedBytes), cipher.final()]);
    }).errorMap((e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, e.message));

/**
 * Returns true if the provided document is an IronCore CMK encrypted document. Checks that we have the expected header on the front
 * of the document.
 */
export const isCmkEncryptedDocument = (bytes: Buffer): boolean =>
    bytes.length > DOCUMENT_HEADER_META_LENGTH && bytes[0] === CURRENT_DOCUMENT_HEADER_VERSION[0] && containsIroncoreMagic(bytes) && getHeaderSize(bytes) === 0;

/**
 * Encrypt the provided document with the provided DEK. Encrypts all fields within the document with the same key but with separate IVs per field.
 */
export const encryptDocument = (document: PlaintextDocument, dek: Base64String): Future<TenantSecurityClientException, EncryptedDocument> => {
    const dekBytes = Buffer.from(dek, "base64");
    const futuresMap = Object.entries(document).reduce((currentMap, [fieldId, fieldBytes]) => {
        currentMap[fieldId] = encryptField(fieldBytes, dekBytes);
        return currentMap;
    }, {} as Record<string, Future<TenantSecurityClientException, Buffer>>);

    return Future.all(futuresMap);
};

/**
 * Encrypt the provided batch of documents using the provided list of wrapped keys. We should have at least one key or API error per document ID
 * in the provided documents. Returns a map from document ID to either the encrypted result, or an exception.
 */
export const encryptBatchDocuments = (
    documentKeys: BatchWrapKeyResponse,
    documents: PlaintextDocumentCollection
): Future<TenantSecurityClientException, Record<string, BatchEncryptResult>> => {
    const reduceResult: Record<string, Future<TenantSecurityClientException, BatchEncryptResult>> = {};
    const futuresMap = Object.entries(documents).reduce((currentMap, [documentId, plaintextDocument]) => {
        if (documentKeys.failures[documentId]) {
            const {code, message} = documentKeys.failures[documentId];
            currentMap[documentId] = Future.of(new TenantSecurityClientException(code, message));
        } else {
            currentMap[documentId] = encryptDocument(plaintextDocument, documentKeys.keys[documentId].dek)
                .map<BatchEncryptResult>((eDoc) => ({
                    encryptedDocument: eDoc,
                    edek: documentKeys.keys[documentId].edek,
                }))
                .handleWith((e) => Future.of(e));
        }
        return currentMap;
    }, reduceResult);

    return Future.all(futuresMap);
};

/**
 * Encrypt the provided batch of previously encrypted documents using the provded unwrapped keys. We should have at least one key or API
 * error per document ID in the provided documents. Returns a map from document ID to either the encrypted result, or an exception.
 */
export const encryptBatchDocumentsWithExistingKey = (
    documentDeks: BatchUnwrapKeyResponse,
    documents: PlaintextDocumentWithEdekCollection
): Future<TenantSecurityClientException, Record<string, BatchEncryptResult>> => {
    const reduceResult: Record<string, Future<TenantSecurityClientException, BatchEncryptResult>> = {};
    const futuresMap = Object.entries(documents).reduce((currentMap, [documentId, {plaintextDocument, edek}]) => {
        if (documentDeks.failures[documentId]) {
            const {code, message} = documentDeks.failures[documentId];
            currentMap[documentId] = Future.of(new TenantSecurityClientException(code, message));
        } else {
            currentMap[documentId] = encryptDocument(plaintextDocument, documentDeks.keys[documentId].dek)
                .map<BatchEncryptResult>((eDoc) => ({
                    encryptedDocument: eDoc,
                    edek,
                }))
                .handleWith((e) => Future.of(e));
        }
        return currentMap;
    }, reduceResult);
    return Future.all(futuresMap);
};

/**
 * Decrypt all of the provided encrypted document fields using the provided DEK.
 */
export const decryptDocument = (encryptedDocument: EncryptedDocument, dek: Base64String): Future<TenantSecurityClientException, PlaintextDocument> => {
    const dekBytes = Buffer.from(dek, "base64");
    const futuresMap = Object.entries(encryptedDocument).reduce((currentMap, [fieldId, fieldBytes]) => {
        currentMap[fieldId] = parseEncryptedDocumentParts(fieldBytes).flatMap((parts) => decryptField(parts, dekBytes));
        return currentMap;
    }, {} as Record<string, Future<TenantSecurityClientException, Buffer>>);

    return Future.all(futuresMap);
};

/**
 * Decrypt the provided list of documents using the provided list of document DEKs. It's expected that each document provided has either an unwrapped key
 * in the provided list or an unwrap error. Returns a combined list of document IDs to decrypted results or TSC exceptions.
 */
export const decryptBatchDocuments = (
    documentDeks: BatchUnwrapKeyResponse,
    documents: EncryptedDocumentWithEdekCollection
): Future<TenantSecurityClientException, Record<string, BatchDecryptResult>> => {
    const reduceResult: Record<string, Future<TenantSecurityClientException, BatchDecryptResult>> = {};
    const futuresMap = Object.entries(documents).reduce((currentMap, [documentId, {encryptedDocument, edek}]) => {
        if (documentDeks.failures[documentId]) {
            const {code, message} = documentDeks.failures[documentId];
            currentMap[documentId] = Future.of(new TenantSecurityClientException(code, message));
        } else {
            currentMap[documentId] = decryptDocument(encryptedDocument, documentDeks.keys[documentId].dek)
                .map<BatchDecryptResult>((decryptedDoc) => ({
                    plaintextDocument: decryptedDoc,
                    edek,
                }))
                .handleWith((e) => Future.of(e));
        }
        return currentMap;
    }, reduceResult);

    return Future.all(futuresMap);
};
