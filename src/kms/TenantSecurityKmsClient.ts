import {
    Base64String,
    BatchResult,
    EncryptedDocumentWithEdek,
    EncryptedDocumentWithEdekCollection,
    PlaintextDocument,
    PlaintextDocumentCollection,
    PlaintextDocumentWithEdek,
    PlaintextDocumentWithEdekCollection,
} from "../../tenant-security-nodejs";
import RequestMetadata from "../RequestMetadata";
import {TenantSecurityClientException} from "../TenantSecurityClientException";
import * as Crypto from "./Crypto";
import * as KmsApi from "./KmsApi";

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
        if (batchResult instanceof TenantSecurityClientException) {
            currentMap.failures[documentId] = batchResult;
            currentMap.hasFailures = true;
        } else {
            currentMap.successes[documentId] = batchResult;
            currentMap.hasSuccesses = true;
        }
        return currentMap;
    }, resultStructure);
};

export class TenantSecurityKmsClient {
    private tspDomain: string;
    private apiKey: string;
    constructor(tspDomain: string, apiKey: string) {
        if (typeof tspDomain !== "string" || tspDomain.length === 0) {
            throw new Error("No value provided for TSP Domain");
        }
        if (typeof apiKey !== "string" || apiKey.length === 0) {
            throw new Error("No value provided for TSP API Key");
        }
        this.tspDomain = tspDomain;
        this.apiKey = apiKey;
    }

    /**
     *
     */
    isCiphertext = (bytes: Buffer): boolean => Crypto.isCmkEncryptedDocument(bytes);

    /**
     *
     */
    encryptDocument = (document: PlaintextDocument, metadata: RequestMetadata): Promise<EncryptedDocumentWithEdek> =>
        KmsApi.wrapKey(this.tspDomain, this.apiKey, metadata)
            .flatMap((wrapResponse) =>
                Crypto.encryptDocument(document, wrapResponse.dek).map((encryptedDocument) => ({
                    edek: wrapResponse.edek,
                    encryptedDocument,
                }))
            )
            .toPromise();

    /**
     *
     */
    encryptDocumentWithExistingKey = (document: PlaintextDocumentWithEdek, metadata: RequestMetadata): Promise<EncryptedDocumentWithEdek> =>
        KmsApi.unwrapKey(this.tspDomain, this.apiKey, document.edek, metadata)
            .flatMap((unwrapResponse) => Crypto.encryptDocument(document.plaintextDocument, unwrapResponse.dek))
            .map((encryptedDocument) => ({
                edek: document.edek,
                encryptedDocument,
            }))
            .toPromise();

    /**
     *
     */
    encryptDocumentBatch = (documentList: PlaintextDocumentCollection, metadata: RequestMetadata): Promise<BatchResult<EncryptedDocumentWithEdek>> =>
        KmsApi.batchWrapKeys(this.tspDomain, this.apiKey, Object.keys(documentList), metadata)
            .flatMap((batchWrapResponse) => Crypto.encryptBatchDocuments(batchWrapResponse, documentList))
            .map<BatchResult<EncryptedDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();

    /**
     *
     */
    encryptDocumentBatchWithExistingKey = (
        documentList: PlaintextDocumentWithEdekCollection,
        metadata: RequestMetadata
    ): Promise<BatchResult<EncryptedDocumentWithEdek>> => {
        //Extract out the list of existing EDEKs in the provided documents as a map from document ID to EDEK
        const edeks = Object.entries(documentList).reduce((currentMap, [docId, {edek}]) => {
            currentMap[docId] = edek;
            return currentMap;
        }, {} as Record<string, Base64String>);

        return KmsApi.batchUnwrapKey(this.tspDomain, this.apiKey, edeks, metadata)
            .flatMap((unwrappedKeys) => Crypto.encryptBatchDocumentsWithExistingKey(unwrappedKeys, documentList))
            .map<BatchResult<EncryptedDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();
    };

    /**
     *
     */
    decryptDocument = (encryptedDoc: EncryptedDocumentWithEdek, metadata: RequestMetadata): Promise<PlaintextDocumentWithEdek> =>
        KmsApi.unwrapKey(this.tspDomain, this.apiKey, encryptedDoc.edek, metadata)
            .flatMap((unwrapResponse) =>
                Crypto.decryptDocument(encryptedDoc.encryptedDocument, unwrapResponse.dek).map((plaintextDocument) => ({
                    plaintextDocument,
                    edek: encryptedDoc.edek,
                }))
            )
            .toPromise();

    /**
     *
     */
    decryptDocumentBatch = (documentList: EncryptedDocumentWithEdekCollection, metadata: RequestMetadata): Promise<BatchResult<PlaintextDocumentWithEdek>> => {
        const edeks = Object.entries(documentList).reduce((currentMap, [docId, {edek}]) => {
            currentMap[docId] = edek;
            return currentMap;
        }, {} as Record<string, Base64String>);
        return KmsApi.batchUnwrapKey(this.tspDomain, this.apiKey, edeks, metadata)
            .flatMap((unwrappedKeys) => Crypto.decryptBatchDocuments(unwrappedKeys, documentList))
            .map<BatchResult<PlaintextDocumentWithEdek>>(mapBatchOperationToResult)
            .toPromise();
    };
}
