import {
    BatchResult,
    DeterministicEncryptedField,
    DeterministicPlaintextField,
    FieldMetadata,
    DeterministicPlaintextFieldCollection,
    DeterministicEncryptedFieldCollection,
} from "../Util";
import * as DetCrypto from "./DeterministicCrypto";
import * as KmsApi from "./KmsApi";
import {deterministicCollectionToPathMap, getDerivedKeys} from "./KmsApi";
export {KmsException} from "./KmsException";
import * as Util from "./Util";
import {TenantSecurityErrorCode} from "../TenantSecurityException";

export class DeterministicTenantSecurityClient {
    private tspDomain: string;
    private apiKey: string;

    /**
     * Constructor for DeterministicTenantSecurityClient class.
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
     * Determine if the provided bytes are a deterministically encrypted field.
     */
    isCiphertext = (bytes: Buffer): boolean => Util.isDeterministicEncryptedField(bytes);

    /**
     * Deterministically encrypt the provided field using the tenant's current secret.
     */
    encryptField = (field: DeterministicPlaintextField, metadata: FieldMetadata): Promise<DeterministicEncryptedField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, {[field.secretPath]: [field.derivationPath]}, metadata)
            .flatMap((deriveResponse) => Util.verifyHasPrimaryConfig(deriveResponse, TenantSecurityErrorCode.DETERMINISTIC_FIELD_ENCRYPT_FAILED))
            .flatMap((deriveResponse) => DetCrypto.encryptField(field, getDerivedKeys(deriveResponse, field.secretPath, field.derivationPath)))
            .toPromise();

    /**
     * Deterministically encrypt a batch of new fields using the tenant's primary KMS. Supports partial failure and returns a list of fields that were successfully
     * encrypted as well as a list of errors for fields that failed to be encrypted.
     */
    encryptFieldBatch = (fields: DeterministicPlaintextFieldCollection, metadata: FieldMetadata): Promise<BatchResult<DeterministicEncryptedField>> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, deterministicCollectionToPathMap(fields), metadata)
            .flatMap((deriveResponse) => Util.verifyHasPrimaryConfig(deriveResponse, TenantSecurityErrorCode.DETERMINISTIC_FIELD_ENCRYPT_FAILED))
            .flatMap((deriveResponse) => DetCrypto.batchEncryptField(fields, deriveResponse))
            .toPromise();

    /**
     * Decrypt the provided deterministically encrypted field.
     */
    decryptField = (encryptedDoc: DeterministicEncryptedField, metadata: FieldMetadata): Promise<DeterministicPlaintextField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, {[encryptedDoc.secretPath]: [encryptedDoc.derivationPath]}, metadata)
            .flatMap((deriveResponse) =>
                DetCrypto.decryptField(encryptedDoc, getDerivedKeys(deriveResponse, encryptedDoc.secretPath, encryptedDoc.derivationPath))
            )
            .toPromise();

    /**
     * Deterministically decrypt a batch of fields using the tenant's KMS that was used for encryption. Supports partial failure and will return both
     * successfully decrypted fields as well as fields that failed to be decrypted.
     */
    decryptFieldBatch = (fields: DeterministicEncryptedFieldCollection, metadata: FieldMetadata): Promise<BatchResult<DeterministicPlaintextField>> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, deterministicCollectionToPathMap(fields), metadata)
            .flatMap((deriveResponse) => DetCrypto.batchDecryptField(fields, deriveResponse))
            .toPromise();

    /**
     * Decrypt the provided deterministically encrypted field and re-encrypt it with the current tenant secret.
     * This should be called when rotating from one tenant secret to another.
     */
    rotateField = (encryptedDoc: DeterministicEncryptedField, metadata: FieldMetadata): Promise<DeterministicEncryptedField> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, {[encryptedDoc.secretPath]: [encryptedDoc.derivationPath]}, metadata)
            .flatMap((deriveResponse) => Util.verifyHasPrimaryConfig(deriveResponse, TenantSecurityErrorCode.DETERMINISTIC_ROTATE_FAILED))
            .flatMap((deriveResponse) => {
                const derivedKeys = getDerivedKeys(deriveResponse, encryptedDoc.secretPath, encryptedDoc.derivationPath);
                return DetCrypto.rotateField(encryptedDoc, derivedKeys);
            })
            .toPromise();

    /**
     * Determinally decrypt a batch of fields using the tenant's KMS that was used for encryption, then re-encrypt them with the current tenant secret.
     * Supports partial failure and will return both successfully re-encrypted fields as well as fields that failed to be re-encrypted.
     */
    rotateFieldBatch = (fields: DeterministicEncryptedFieldCollection, metadata: FieldMetadata): Promise<BatchResult<DeterministicEncryptedField>> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, deterministicCollectionToPathMap(fields), metadata)
            .flatMap((deriveResponse) => Util.verifyHasPrimaryConfig(deriveResponse, TenantSecurityErrorCode.DETERMINISTIC_ROTATE_FAILED))
            .flatMap((deriveResponse) => DetCrypto.batchRotateField(fields, deriveResponse))
            .toPromise();

    /**
     * Deterministically encrypt the provided field with all current and in-rotation secrets for the tenant.
     * All of the resulting search terms should be used in combination when searching for the field.
     */
    generateSearchTerms = (field: DeterministicPlaintextField, metadata: FieldMetadata): Promise<DeterministicEncryptedField[]> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, {[field.secretPath]: [field.derivationPath]}, metadata)
            .flatMap((deriveResponse) => DetCrypto.generateSearchTerms(field, KmsApi.getDerivedKeys(deriveResponse, field.secretPath, field.derivationPath)))
            .toPromise();

    /**
     * Deterministically encrypt a batch of fields with all current and in-rotation secrets for the tenant.
     * Supports partial failure and will return both successfully encrypted fields as well as fields that failed to be encrypted.
     */
    generateSearchTermsBatch = (fields: DeterministicPlaintextFieldCollection, metadata: FieldMetadata): Promise<BatchResult<DeterministicEncryptedField[]>> =>
        KmsApi.deriveKey(this.tspDomain, this.apiKey, deterministicCollectionToPathMap(fields), metadata)
            .flatMap((deriveResponse) => DetCrypto.batchGenerateSearchTerms(fields, deriveResponse))
            .toPromise();
}
