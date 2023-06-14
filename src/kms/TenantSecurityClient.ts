import {EventMetadata} from "../logdriver/EventMetadata";
import {SecurityEvent} from "../logdriver/SecurityEvent";
import * as SecurityEventApi from "../logdriver/SecurityEventApi";
import {TenantSecurityException} from "../TenantSecurityException";
import {
    Base64String,
    BatchResult,
    DeterministicEncryptedField,
    DeterministicPlaintextField,
    EncryptedDocumentWithEdek,
    EncryptedDocumentWithEdekCollection,
    FieldMetadata,
    PlaintextDocument,
    PlaintextDocumentCollection,
    PlaintextDocumentWithEdek,
    PlaintextDocumentWithEdekCollection,
    StreamingResponse,
} from "../Util";
import * as Crypto from "./Crypto";
import {DocumentMetadata} from "./DocumentMetadata";
import * as KmsApi from "./KmsApi";
import * as Util from "./Util";
export {KmsException} from "./KmsException";

/**
 * Take a batch result of encrypt/decrypt operations and convert it into the return structure from the SDK, calculating
 * some convenience fields on the response for successes and failures.
 */
const mapBatchOperationToResult = <T>(
    successesAndFailures: Record<string, Crypto.BatchEncryptResult> | Record<string, Crypto.BatchDecryptResult>
): BatchResult<T> => {
    const resultStructure: BatchResult<T> = {
        successes: {} as Record<string, T>,
        failures: {},
        hasSuccesses: false,
        hasFailures: false,
    };
    //Iterate over the successes and failures and add them to the final result shape
    return Object.entries(successesAndFailures).reduce((currentMap, [documentId, batchResult]) => {
        if (batchResult instanceof TenantSecurityException) {
            currentMap.failures[documentId] = batchResult;
            currentMap.hasFailures = true;
        } else {
            currentMap.successes[documentId] = batchResult;
            currentMap.hasSuccesses = true;
        }
        return currentMap;
    }, resultStructure);
};

export class TenantSecurityClient {
    private tspDomain: string;
    private apiKey: string;

    /**
     * Constructor for TenantSecurityClient class.
     *
     * @param tspDomain Domain where the Tenant Security Proxy is running.
     * @param apiKey    Key to use for requests to the Tenant Security Proxy.
     * @throws          If the provided domain or API key is invalid.
     */
    constructor(tspDomain: string, apiKey: string) {
        if (!tspDomain) {
            throw new Error("No value provided for TSP Domain");
        }
        if (!apiKey) {
            throw new Error("No value provided for TSP API Key");
        }
        this.tspDomain = tspDomain;
        this.apiKey = apiKey;
    }

    /**
     * Determine if the provided bytes are a CMK encrypted document.
     */
    isCiphertext = (bytes: Buffer): boolean => Util.isCmkEncryptedDocument(bytes);

    /**
     * Encrypt the provided document of 1-N fields using the tenants primary KMS.
     */
    encryptDocument = (document: PlaintextDocument, metadata: DocumentMetadata): Promise<EncryptedDocumentWithEdek> =>
        KmsApi.wrapKey(this.tspDomain, this.apiKey, metadata)
            .flatMap((wrapResponse) =>
                Crypto.encryptDocument(document, wrapResponse.dek, metadata.tenantId).map((encryptedDocument) => ({
                    edek: wrapResponse.edek,
                    encryptedDocument,
                }))
            )
            .toPromise();

    /**
     * Read in the provided inputSteam, encrypt the bytes, and write them out to the provided outputStream. Returns the EDEK
     */
    encryptStream = (inputStream: NodeJS.ReadableStream, outputStream: NodeJS.WritableStream, metadata: DocumentMetadata): Promise<StreamingResponse> =>
        KmsApi.wrapKey(this.tspDomain, this.apiKey, metadata)
            .flatMap((wrapResponse) =>
                Crypto.encryptStream(inputStream, outputStream, wrapResponse.dek, metadata.tenantId).map(() => ({edek: wrapResponse.edek}))
            )
            .toPromise();

    /**
     * Re-encrypt the provided document of 1-N fields that was previously encrypted with the tenants KMS. Takes the EDEK that was returned on
     * encrypt, unwraps that via the KMS, and encrypts the document fields with it.
     */
    encryptDocumentWithExistingKey = (document: PlaintextDocumentWithEdek, metadata: DocumentMetadata): Promise<EncryptedDocumentWithEdek> =>
        KmsApi.unwrapKey(this.tspDomain, this.apiKey, document.edek, metadata)
            .flatMap((unwrapResponse) => Crypto.encryptDocument(document.plaintextDocument, unwrapResponse.dek, metadata.tenantId))
            .map((encryptedDocument) => ({
                edek: document.edek,
                encryptedDocument,
            }))
            .toPromise();

    /**
     * Encrypt a batch of new documents using the tenant's primary KMS. Supports partial failure and returns a list of documents that were successfully
     * encrypted as well as a list of errors for documents that failed to be encrypted.
     */
    encryptDocumentBatch = (documentList: PlaintextDocumentCollection, metadata: DocumentMetadata): Promise<BatchResult<EncryptedDocumentWithEdek>> =>
        KmsApi.batchWrapKeys(this.tspDomain, this.apiKey, Object.keys(documentList), metadata)
            .flatMap((batchWrapResponse) => Crypto.encryptBatchDocuments(batchWrapResponse, documentList, metadata.tenantId))
            .map<BatchResult<EncryptedDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();

    /**
     * Re-encrypts a batch of documents that were previously encrypted and re-uses the same key. Supports partial failure and returns a list of documents
     * that were successfully encrypted as well as a list of errors for documents that failed to be encrypted.
     */
    encryptDocumentBatchWithExistingKey = (
        documentList: PlaintextDocumentWithEdekCollection,
        metadata: DocumentMetadata
    ): Promise<BatchResult<EncryptedDocumentWithEdek>> => {
        //Extract out the list of existing EDEKs in the provided documents as a map from document ID to EDEK
        const edeks = Object.entries(documentList).reduce((currentMap, [docId, {edek}]) => {
            currentMap[docId] = edek;
            return currentMap;
        }, {} as Record<string, Base64String>);

        return KmsApi.batchUnwrapKey(this.tspDomain, this.apiKey, edeks, metadata)
            .flatMap((unwrappedKeys) => Crypto.encryptBatchDocumentsWithExistingKey(unwrappedKeys, documentList, metadata.tenantId))
            .map<BatchResult<EncryptedDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();
    };

    /**
     * Decrypt the provided encrypted document. Takes the document and EDEK returned on encrypt and unwraps the EDEK via
     * the tenants KMS and uses the resulting DEK to decrypt the fields of the document.
     */
    decryptDocument = (encryptedDoc: EncryptedDocumentWithEdek, metadata: DocumentMetadata): Promise<PlaintextDocumentWithEdek> =>
        KmsApi.unwrapKey(this.tspDomain, this.apiKey, encryptedDoc.edek, metadata)
            .flatMap((unwrapResponse) =>
                Crypto.decryptDocument(encryptedDoc.encryptedDocument, unwrapResponse.dek).map((plaintextDocument) => ({
                    plaintextDocument,
                    edek: encryptedDoc.edek,
                }))
            )
            .toPromise();

    /**
     * Take the provided EDEK and unwrap it with the tenants KMS to a DEK. Then read the provided input stream, decrypt it with the DEK,
     * and write the results to the provided output stream. This method will reject without writing any bytes to the output stream if the
     * DEK being used is not valid for the encrypted bytes in the inputStream.
     */
    decryptStream = (
        edek: Base64String,
        inputStream: NodeJS.ReadableStream,
        outputStream: NodeJS.WritableStream,
        metadata: DocumentMetadata
    ): Promise<StreamingResponse> =>
        KmsApi.unwrapKey(this.tspDomain, this.apiKey, edek, metadata)
            .flatMap((unwrapResponse) => Crypto.decryptStream(inputStream, outputStream, unwrapResponse.dek).map(() => ({edek})))
            .toPromise();

    /**
     * Decrypt a batch of documents using the tenants KMS that was used to encrypt each document. Supports partial failure and will return both
     * successfully decrypted documents as well as documents that failed to be decrypted.
     */
    decryptDocumentBatch = (documentList: EncryptedDocumentWithEdekCollection, metadata: DocumentMetadata): Promise<BatchResult<PlaintextDocumentWithEdek>> => {
        const edeks = Object.entries(documentList).reduce((currentMap, [docId, {edek}]) => {
            currentMap[docId] = edek;
            return currentMap;
        }, {} as Record<string, Base64String>);
        return KmsApi.batchUnwrapKey(this.tspDomain, this.apiKey, edeks, metadata)
            .flatMap((unwrappedKeys) => Crypto.decryptBatchDocuments(unwrappedKeys, documentList))
            .map<BatchResult<PlaintextDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();
    };

    /**
     * @deprecated The `rekeyEdek` method is preferred over this method because the encrypted document is not necessary for re-keying to take place.
     *
     * Re-key a document to a new tenant ID. Takes the document and EDEK returned on encrypt and unwraps the EDEK via
     * the original tenant's KMS. Then re-wraps that DEK with the new tenant's KMS and returns an unchanged EncryptedDocument with a new EDEK.
     * The old tenant and new tenant can be the same in order to re-key the document to the tenant's latest primary config.
     */
    rekeyDocument = (encryptedDoc: EncryptedDocumentWithEdek, newTenantId: string, metadata: DocumentMetadata): Promise<EncryptedDocumentWithEdek> =>
        KmsApi.rekeyKey(this.tspDomain, this.apiKey, encryptedDoc.edek, newTenantId, metadata)
            .map((rekeyResponse) => ({encryptedDocument: encryptedDoc.encryptedDocument, edek: rekeyResponse.edek}))
            .toPromise();

    /**
     * Re-key a document's encrypted document key (EDEK) to a new tenant ID. Unwraps the EDEK via the original tenant's KMS, then re-wraps that DEK
     * with the new tenant's KMS. The old tenant and new tenant can be the same in order to re-key the EDEK to the tenant's latest primary config.
     */
    rekeyEdek = (edek: Base64String, newTenantId: string, metadata: DocumentMetadata): Promise<Base64String> =>
        KmsApi.rekeyKey(this.tspDomain, this.apiKey, edek, newTenantId, metadata)
            .map((rekeyResponse) => rekeyResponse.edek)
            .toPromise();

    /**
     * Send the provided security event to the TSP to be logged and analyzed. Returns void if
     * the security event was successfully received. Note that logging a security event is an asynchronous operation
     * at the TSP, so successful receipt of a security event does not mean that the event is deliverable or has
     * been delivered to the tenant's logging system. It simply means that the event has been received and will be processed.
     *
     * @param event    Security event that represents the action that took place.
     * @param metadata Metadata that provides additional context about the event.
     * @return         Void on successful receipt by TSP
     */
    logSecurityEvent = (event: SecurityEvent, metadata: EventMetadata): Promise<void> =>
        SecurityEventApi.logSecurityEvent(this.tspDomain, this.apiKey, event, metadata).toPromise();

    /**
     * Deterministically encrypt the provided field using the tenant's current secret.
     */
    deterministicEncryptField = (field: DeterministicPlaintextField, metadata: FieldMetadata): Promise<DeterministicEncryptedField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, [field.derivationPath], field.secretPath, metadata)
            .flatMap((deriveResponse) => Crypto.deterministicEncryptField(field, deriveResponse.derivedKeys[field.derivationPath]))
            .toPromise();

    /**
     * Decrypt the provided deterministically encrypted field.
     */
    deterministicDecryptField = (encryptedDoc: DeterministicEncryptedField, metadata: FieldMetadata): Promise<DeterministicPlaintextField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, [encryptedDoc.derivationPath], encryptedDoc.secretPath, metadata)
            .flatMap((deriveResponse) => Crypto.deterministicDecryptField(encryptedDoc, deriveResponse.derivedKeys[encryptedDoc.derivationPath]))
            .toPromise();

    /**
     * Decrypt the provided deterministically encrypted field and re-encrypt it with the current tenant secret.
     */
    deterministicReencryptField = (encryptedDoc: DeterministicEncryptedField, metadata: FieldMetadata): Promise<DeterministicEncryptedField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, [encryptedDoc.derivationPath], encryptedDoc.secretPath, metadata)
            .flatMap((deriveResponse) => {
                const derivedKeys = deriveResponse.derivedKeys[encryptedDoc.derivationPath];
                return Crypto.deterministicDecryptField(encryptedDoc, derivedKeys, true).flatMap((decryptedDoc) =>
                    Crypto.deterministicEncryptField(decryptedDoc, derivedKeys)
                );
            })
            .toPromise();

    /**
     * Deterministically encrypt the provided field with all current and in-rotation secrets for the tenant.
     * All of the resulting `encryptedField`s are valid and should be used in combination when searching for the field.
     */
    deterministicSearch = (field: DeterministicPlaintextField, metadata: FieldMetadata): Promise<DeterministicEncryptedField[]> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, [field.derivationPath], field.secretPath, metadata)
            .flatMap((deriveResponse) => Crypto.deterministicSearch(field, deriveResponse.derivedKeys[field.derivationPath]))
            .toPromise();
}
