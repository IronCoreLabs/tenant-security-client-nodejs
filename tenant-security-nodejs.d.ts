export type Base64String = string;

/**
 * Data to encrypt via the customer's KMS. A document is a collection of 1-N fields that get encrypted
 * with the same KMS key (but use a different IV). Fields contain a name/ID to the bytes of that field
 * to encrypt.
 */
type Document = Record<string, Buffer>;

//Input type for single encrypt operation
export type PlaintextDocument = Document;
//Result of single encrypt operation
export interface EncryptedDocumentWithEdek {
    encryptedDocument: EncryptedDocument;
    edek: Base64String;
}

export interface StreamingResponse {
    edek: Base64String;
}

//Input type for single decrypt operation
export type EncryptedDocument = Document;
//Result of single decrypt operation
export interface PlaintextDocumentWithEdek {
    plaintextDocument: PlaintextDocument;
    edek: Base64String;
}

//Input type for batch encrypt of new fields
export type PlaintextDocumentCollection = Record<string, PlaintextDocument>;
//Input type for batch decrypt of existing fields
export type PlaintextDocumentWithEdekCollection = Record<string, PlaintextDocumentWithEdek>;

//Input type for batch decrypt
export type EncryptedDocumentWithEdekCollection = Record<string, EncryptedDocumentWithEdek>;

//Result type of batch operations
export interface BatchResult<T> {
    successes: Record<string, T>;
    failures: Record<string, TenantSecurityException>;
    hasSuccesses: boolean;
    hasFailures: boolean;
}

//Metadata instance passed with every CMK operation
export class DocumentMetadata {
    constructor(tenantId: string, requestingUserOrServiceId: string, dataLabel: string, requestId?: string, otherData?: Record<string, string>);
}

//List of error codes that can occur during CMK operations
export {TenantSecurityErrorCode} from "./src/TenantSecurityException";

//Custom Error class for exceptions that occur during operations
export class TenantSecurityException extends Error {
    errorCode: number;
    httpResponseCode?: number;
    constructor(code: number, message: string, httpResponseCode?: number);
}

//KMS client class used to perform CMK KMS operations
export class TenantSecurityClient {
    constructor(tspDomain: string, apiKey: string);
    isCiphertext(bytes: Buffer): boolean;
    encryptDocument(document: PlaintextDocument, metadata: DocumentMetadata): Promise<EncryptedDocumentWithEdek>;
    encryptStream(inputStream: NodeJS.ReadableStream, outputStream: NodeJS.WritableStream, metadata: DocumentMetadata): Promise<StreamingResponse>;
    encryptDocumentWithExistingKey(document: PlaintextDocumentWithEdek, metadata: DocumentMetadata): Promise<EncryptedDocumentWithEdek>;
    encryptDocumentBatch(documentList: PlaintextDocumentCollection, metadata: DocumentMetadata): Promise<BatchResult<EncryptedDocumentWithEdek>>;
    encryptDocumentBatchWithExistingKey(
        documentList: PlaintextDocumentWithEdekCollection,
        metadata: DocumentMetadata
    ): Promise<BatchResult<EncryptedDocumentWithEdek>>;
    decryptDocument(encryptedDoc: EncryptedDocumentWithEdek, metadata: DocumentMetadata): Promise<PlaintextDocumentWithEdek>;
    decryptStream(
        edek: Base64String,
        inputStream: NodeJS.ReadableStream,
        outputStream: NodeJS.WritableStream,
        metadata: DocumentMetadata
    ): Promise<StreamingResponse>;
    decryptDocumentBatch(documentList: EncryptedDocumentWithEdekCollection, metadata: DocumentMetadata): Promise<BatchResult<PlaintextDocumentWithEdek>>;
}
