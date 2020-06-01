import * as crypto from "crypto";
import Future from "futurejs";
import {pipeline} from "stream";
import {promisify} from "util";
import {ironcorelabs} from "../../proto/ts/DocumentHeader";
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
import {AES_ALGORITHM, AES_GCM_TAG_LENGTH, CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, HEADER_META_LENGTH_LENGTH, IV_BYTE_LENGTH} from "./Constants";
import {BatchUnwrapKeyResponse, BatchWrapKeyResponse} from "./KmsApi";
import {StreamingDecryption, StreamingEncryption} from "./StreamingAes";
import * as Util from "./Util";
const pPipeline = promisify(pipeline);
const {v3DocumentHeader, SaaSShieldHeader} = ironcorelabs.proto;

interface EncryptedDocumentParts {
    iv: Buffer;
    encryptedBytes: Buffer;
    gcmTag: Buffer;
}

export type BatchEncryptResult = TenantSecurityClientException | EncryptedDocumentWithEdek;
export type BatchDecryptResult = TenantSecurityClientException | PlaintextDocumentWithEdek;

/**
 * Encrypt the provided bytes with the provided key using AES-256-GCM.
 */
const encryptBytes = (bytes: Buffer, key: Buffer, iv?: Buffer): Future<TenantSecurityClientException, Buffer> =>
    Future.tryF(() => {
        const ivBytes = iv && iv.length === IV_BYTE_LENGTH ? iv : crypto.randomBytes(IV_BYTE_LENGTH);
        const cipher = crypto.createCipheriv(AES_ALGORITHM, key, ivBytes);
        return Buffer.concat([ivBytes, cipher.update(bytes), cipher.final(), cipher.getAuthTag()]);
    }).errorMap((e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_ENCRYPT_FAILED, e.message));

/**
 * Take an AES-GCM encrypted value and break it apart into the IV/encrypted value/auth tag.
 */
const decomposeEncryptedValue = (encryptedValue: Buffer): EncryptedDocumentParts => ({
    iv: encryptedValue.slice(0, IV_BYTE_LENGTH),
    encryptedBytes: encryptedValue.slice(IV_BYTE_LENGTH, encryptedValue.length - AES_GCM_TAG_LENGTH),
    gcmTag: encryptedValue.slice(encryptedValue.length - AES_GCM_TAG_LENGTH),
});

/**
 * Deconstruct the provided encrypted document into its component parts. Strips off the header and then slices off the IV on the
 * front and the GCM auth tag on the back.
 */
const decomposeField = (encryptedBytesWithHeader: Buffer): Future<TenantSecurityClientException, EncryptedDocumentParts> =>
    Util.extractDocumentHeaderFromBytes(encryptedBytesWithHeader).map(({encryptedDoc}) => decomposeEncryptedValue(encryptedDoc));

/**
 * Take the provided document DEK and protobuf header and calculate the full header that goes on the front of the document.
 */
const generateEncryptedDocumentHeader = (dek: Buffer, headerData: ironcorelabs.proto.ISaaSShieldHeader): Future<TenantSecurityClientException, Buffer> => {
    return encryptBytes(Buffer.from(SaaSShieldHeader.encode(headerData).finish()), dek).map((encryptedPb) => {
        //Compose the auth tag using the random IV generated during encrypt with the GCM auth tag
        const {iv, gcmTag} = decomposeEncryptedValue(encryptedPb);
        const pbHeader = Buffer.from(v3DocumentHeader.encode({sig: Buffer.concat([iv, gcmTag]), saasShield: headerData}).finish());
        const headerDataView = new DataView(new ArrayBuffer(HEADER_META_LENGTH_LENGTH));
        headerDataView.setUint16(0, pbHeader.length, false);
        return Buffer.concat([CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, Buffer.from(headerDataView.buffer), pbHeader]);
    });
};

/**
 * Take the provided plaintext bytes, generate a new random IV, and encrypt the data with the provided key.
 */
const encryptField = (
    plaintextFieldBytes: Buffer,
    dek: Buffer,
    headerData: ironcorelabs.proto.ISaaSShieldHeader
): Future<TenantSecurityClientException, Buffer> =>
    Future.gather2(generateEncryptedDocumentHeader(dek, headerData), encryptBytes(plaintextFieldBytes, dek)).map(([docHeader, encryptedDoc]) =>
        Buffer.concat([docHeader, encryptedDoc])
    );

/**
 * Attempt to parse the provided encrypted field bytes as a CMK document and AES decrypt them with the provided key.
 */
const decryptField = ({iv, encryptedBytes, gcmTag}: EncryptedDocumentParts, dek: Buffer): Future<TenantSecurityClientException, Buffer> =>
    Future.tryF(() => {
        const cipher = crypto.createDecipheriv(AES_ALGORITHM, dek, iv);
        cipher.setAuthTag(gcmTag);
        return Buffer.concat([cipher.update(encryptedBytes), cipher.final()]);
    }).errorMap((e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, e.message));

/**
 * Check if the provided header content can be verified against the provided signature using the provided DEK. Takes the existing IV from
 * the front of the signature and uses it plus the DEK to encrypt the probotuf encoded header. Then verifies that the resulting GCM auth
 * tag matches. If the provided header is empty, verification will succeed.
 */
const verifyHeaderSignature = (header: ironcorelabs.proto.Iv3DocumentHeader | undefined, dek: Buffer): Future<TenantSecurityClientException, void> => {
    //If we have no header or authTag, that means this document was encrypted before the header was added, which would only happen if the
    //document was encrypted with the Java SDK. In that case, we'll just ignore the verification and try to decrypt, which might still work.
    if (!header || !header.saasShield || !header.sig) {
        return Future.of(undefined);
    }
    const headerPb = Buffer.from(SaaSShieldHeader.encode(header.saasShield).finish());
    const {iv, gcmTag} = decomposeEncryptedValue(Buffer.from(header.sig));
    return encryptBytes(headerPb, dek, iv).flatMap((encryptedPb) => {
        const verifiedAuthTag = decomposeEncryptedValue(encryptedPb).gcmTag;
        return verifiedAuthTag.equals(gcmTag)
            ? Future.of(undefined)
            : Future.reject(new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, "Invalid DEK provided to decrypt this document"));
    });
};

/**
 * Encrypt the provided document with the provided DEK. Encrypts all fields within the document with the same key but with separate IVs per field.
 */
export const encryptDocument = (document: PlaintextDocument, dek: Base64String, tenantId: string): Future<TenantSecurityClientException, EncryptedDocument> => {
    const dekBytes = Buffer.from(dek, "base64");
    const futuresMap = Object.entries(document).reduce((currentMap, [fieldId, fieldBytes]) => {
        currentMap[fieldId] = encryptField(fieldBytes, dekBytes, {tenantId});
        return currentMap;
    }, {} as Record<string, Future<TenantSecurityClientException, Buffer>>);

    return Future.all(futuresMap);
};

/**
 * Read the provided input stream, encrypt the content using the provided DEK, and write it to the provided output stream.
 */
export const encryptStream = (
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
    dek: Base64String,
    tenantId: string
): Future<TenantSecurityClientException, void> => {
    const dekBytes = Buffer.from(dek, "base64");
    return generateEncryptedDocumentHeader(dekBytes, {tenantId}).flatMap((docHeader) =>
        Future.tryP(() => pPipeline(inputStream, new StreamingEncryption(dekBytes, docHeader).getEncryptionStream(), outputStream)).errorMap(
            (e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_ENCRYPT_FAILED, e.message)
        )
    );
};

/**
 * Encrypt the provided batch of documents using the provided list of wrapped keys. We should have at least one key or API error per document ID
 * in the provided documents. Returns a map from document ID to either the encrypted result, or an exception.
 */
export const encryptBatchDocuments = (
    documentKeys: BatchWrapKeyResponse,
    documents: PlaintextDocumentCollection,
    tenantId: string
): Future<TenantSecurityClientException, Record<string, BatchEncryptResult>> => {
    const reduceResult: Record<string, Future<TenantSecurityClientException, BatchEncryptResult>> = {};
    const futuresMap = Object.entries(documents).reduce((currentMap, [documentId, plaintextDocument]) => {
        if (documentKeys.failures[documentId]) {
            const {code, message} = documentKeys.failures[documentId];
            currentMap[documentId] = Future.of(new TenantSecurityClientException(code, message));
        } else {
            currentMap[documentId] = encryptDocument(plaintextDocument, documentKeys.keys[documentId].dek, tenantId)
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
 * Encrypt the provided batch of previously encrypted documents using the provided unwrapped keys. We should have at least one key or API
 * error per document ID in the provided documents. Returns a map from document ID to either the encrypted result, or an exception.
 */
export const encryptBatchDocumentsWithExistingKey = (
    documentDeks: BatchUnwrapKeyResponse,
    documents: PlaintextDocumentWithEdekCollection,
    tenantId: string
): Future<TenantSecurityClientException, Record<string, BatchEncryptResult>> => {
    const reduceResult: Record<string, Future<TenantSecurityClientException, BatchEncryptResult>> = {};
    const futuresMap = Object.entries(documents).reduce((currentMap, [documentId, {plaintextDocument, edek}]) => {
        if (documentDeks.failures[documentId]) {
            const {code, message} = documentDeks.failures[documentId];
            currentMap[documentId] = Future.of(new TenantSecurityClientException(code, message));
        } else {
            currentMap[documentId] = encryptDocument(plaintextDocument, documentDeks.keys[documentId].dek, tenantId)
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
    const futuresMap = Object.entries(encryptedDocument).reduce((currentMap, [fieldId, fieldBytes]) => {
        currentMap[fieldId] = decomposeField(fieldBytes).flatMap((parts) => decryptField(parts, Buffer.from(dek, "base64")));
        return currentMap;
    }, {} as Record<string, Future<TenantSecurityClientException, Buffer>>);

    return Future.all(futuresMap);
};

/**
 * Decrypt the bytes in the provided inputStream and write the result to the provided outfile path if successful.
 */
export const decryptStream = (
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
    dek: Base64String
): Future<TenantSecurityClientException, void> => {
    const dekBytes = Buffer.from(dek, "base64");
    return Util.extractDocumentHeaderFromStream(inputStream)
        .flatMap((maybeHeader) => verifyHeaderSignature(maybeHeader, dekBytes))
        .flatMap(() =>
            Future.tryP(() => pPipeline(inputStream, new StreamingDecryption(dekBytes).getDecryptionStream(), outputStream)).errorMap(
                (e) => new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, e.message)
            )
        );
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
