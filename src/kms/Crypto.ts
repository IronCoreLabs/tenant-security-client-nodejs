import * as crypto from "crypto";
import * as fs from "fs";
import Future from "futurejs";
import {tmpdir} from "os";
import * as path from "path";
import {pipeline} from "stream";
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
import {AES_ALGORITHM, AES_GCM_TAG_LENGTH, IV_BYTE_LENGTH} from "./Constants";
import {BatchUnwrapKeyResponse, BatchWrapKeyResponse} from "./KmsApi";
import {StreamingDecryption, StreamingEncryption} from "./StreamingAes";
import * as Util from "./Util";

interface EncryptedDocumentParts {
    iv: Buffer;
    encryptedBytes: Buffer;
    gcmTag: Buffer;
}

export type BatchEncryptResult = TenantSecurityClientException | EncryptedDocumentWithEdek;
export type BatchDecryptResult = TenantSecurityClientException | PlaintextDocumentWithEdek;

/**
 * Deconstruct the provided encrypted document into its component parts. Strips off the header and then slices off the IV on the
 * front and the GCM auth tag on the back.
 */
const parseEncryptedDocumentParts = (encryptedBytesWithHeader: Buffer): Future<TenantSecurityClientException, EncryptedDocumentParts> =>
    Util.splitDocumentHeaderAndEncryptedContent(encryptedBytesWithHeader).map(({encryptedDoc}) => ({
        iv: encryptedDoc.slice(0, IV_BYTE_LENGTH),
        encryptedBytes: encryptedDoc.slice(IV_BYTE_LENGTH, encryptedDoc.length - AES_GCM_TAG_LENGTH),
        gcmTag: encryptedDoc.slice(encryptedDoc.length - AES_GCM_TAG_LENGTH),
    }));

/**
 * Take the provided plaintext bytes, generate a new random IV, and encrypt the data with the provided key.
 */
const encryptField = (plaintextFieldBytes: Buffer, aesKey: Buffer): Future<TenantSecurityClientException, Buffer> =>
    Future.tryF(() => {
        const iv = crypto.randomBytes(IV_BYTE_LENGTH);
        const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);
        return Buffer.concat([Util.generateHeader(), iv, cipher.update(plaintextFieldBytes), cipher.final(), cipher.getAuthTag()]);
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
 * Read the provided input stream, encrypt the content using the provided DEK, and write it to the provided output stream.
 */
export const encryptStream = (
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
    dek: Base64String,
    edek: Base64String
): Future<TenantSecurityClientException, undefined> => {
    const encryptionStream = new StreamingEncryption(Buffer.from(dek, "base64"), Buffer.from(edek, "base64"));
    return new Future<TenantSecurityClientException, undefined>((reject, resolve) => {
        pipeline(inputStream, encryptionStream.getEncryptionStream(), outputStream, (e) => {
            if (e) {
                reject(new TenantSecurityClientException(ErrorCodes.DOCUMENT_ENCRYPT_FAILED, e.message));
            } else {
                resolve(undefined);
            }
        });
    });
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
 * Encrypt the provided batch of previously encrypted documents using the provided unwrapped keys. We should have at least one key or API
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
    const futuresMap = Object.entries(encryptedDocument).reduce((currentMap, [fieldId, fieldBytes]) => {
        currentMap[fieldId] = parseEncryptedDocumentParts(fieldBytes).flatMap((parts) => decryptField(parts, Buffer.from(dek, "base64")));
        return currentMap;
    }, {} as Record<string, Future<TenantSecurityClientException, Buffer>>);

    return Future.all(futuresMap);
};

/**
 * Decrypt the bytes in the provided inputStream and write the result to the provided outfile path if successful.
 */
export const decryptStream = (inputStream: NodeJS.ReadableStream, outfile: string, dek: Base64String): Future<TenantSecurityClientException, undefined> => {
    const decryptionStream = new StreamingDecryption(Buffer.from(dek, "base64"));
    //Create a temp file in a temp directory within the OS default temp dir
    const tempDirectoryName = path.join(fs.realpathSync(tmpdir()), crypto.randomBytes(16).toString("hex"));
    fs.mkdirSync(tempDirectoryName);
    const tempFileName = path.join(tempDirectoryName, crypto.randomBytes(16).toString("hex"));
    const tempWritable = fs.createWriteStream(tempFileName);
    return new Future((reject, resolve) => {
        pipeline(inputStream, decryptionStream.getDecryptionStream(), tempWritable, (e) => {
            if (e) {
                tempWritable.close();
                fs.unlinkSync(tempFileName);
                fs.rmdirSync(tempDirectoryName);
                reject(new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, e.message));
            } else {
                try {
                    fs.renameSync(tempFileName, outfile);
                    fs.rmdirSync(tempDirectoryName);
                    resolve(undefined);
                } catch (e) {
                    reject(new TenantSecurityClientException(ErrorCodes.DOCUMENT_DECRYPT_FAILED, e.message));
                }
            }
        });
    });
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
