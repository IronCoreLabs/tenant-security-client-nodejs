import Future from "futurejs";
import {TenantSecurityErrorCode, TenantSecurityException} from "../TenantSecurityException";
import {TenantSecurityExceptionUtils} from "../TenantSecurityExceptionUtils";
import {TscException} from "../TscException";
import * as miscreant from "miscreant";
import {
    BatchResult,
    DeterministicEncryptedField,
    DeterministicEncryptedFieldCollection,
    DeterministicPlaintextField,
    DeterministicPlaintextFieldCollection,
    mapBatchOperationToResult,
} from "../Util";
import {DETERMINISTIC_HEADER_PADDING} from "./Constants";
import {DerivedKey, DeriveKeyResponse, getDerivedKeys} from "./KmsApi";

const cryptoProvider = new miscreant.PolyfillCryptoProvider();

interface DeterministicEncryptedFieldParts {
    tenantSecretId: number;
    encryptedBytes: Buffer;
}

export type BatchDeterministicEncryptResult = TenantSecurityException | DeterministicEncryptedField;
export type BatchDeterministicDecryptResult = TenantSecurityException | DeterministicPlaintextField;
export type BatchDeterministicSearchResult = TenantSecurityException | DeterministicEncryptedField[];

/**
 * Deterministically encrypt the provided field with the current key from `derivedKeys`.
 */
export const encryptField = (
    field: DeterministicPlaintextField,
    derivedKeys: DerivedKey[] | undefined
): Future<TenantSecurityException, DeterministicEncryptedField> => {
    const current = derivedKeys?.find((key) => key.current);
    if (current === undefined) {
        return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_FIELD_ENCRYPT_FAILED, "Failed deterministic encryption."));
    }
    const dekBytes = Buffer.from(current.derivedKey, "base64");
    const encryptedFuture = Future.gather2(generateEncryptedFieldHeader(current.tenantSecretId), encryptBytes(field.plaintextField, dekBytes)).map(
        ([header, encryptedDoc]) => Buffer.concat([header, encryptedDoc])
    );
    return encryptedFuture.map((encrypted) => ({
        encryptedField: encrypted,
        derivationPath: field.derivationPath,
        secretPath: field.secretPath,
    }));
};

/**
 * Encode the tenant secret ID as 4 bytes, then attach two bytes of 0s. Fails if the tenant secret ID can't fit into 4 bytes.
 */
export const generateEncryptedFieldHeader = (tenantSecretId: number): Future<TenantSecurityException, Buffer> => {
    if (tenantSecretId < 0 || tenantSecretId > Math.pow(2, 32) - 1) {
        return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_HEADER_ERROR, "Failed to generate header."));
    }
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, tenantSecretId, false); // byteOffset = 0; litteEndian = false
    return Future.of(Buffer.concat([Buffer.from(view.buffer), DETERMINISTIC_HEADER_PADDING]));
};

/**
 * Encrypt the provided bytes with the provided key using AES-256-SIV.
 * associatedData is not used by our deterministic encryption, but is used in our unit tests of miscreant encryption.
 */
export const encryptBytes = (bytes: Buffer, key: Buffer, associatedData: Uint8Array[] = []): Future<TenantSecurityException, Buffer> => {
    return Future.tryP(() => miscreant.SIV.importKey(key, "AES-SIV", cryptoProvider))
        .flatMap((siv) =>
            Future.tryP(async () => {
                const encrypted = await siv.seal(bytes, associatedData);
                return Buffer.from(encrypted);
            })
        )
        .errorMap((e) => new TscException(TenantSecurityErrorCode.DETERMINISTIC_FIELD_ENCRYPT_FAILED, e.message));
};

export const checkRotationFieldNoOp = (
    encryptedField: DeterministicEncryptedField,
    derivedKeys: DerivedKey[] | undefined
): Future<TenantSecurityException, boolean> =>
    decomposeField(encryptedField.encryptedField).flatMap((parts) => {
        const currentKeyId = derivedKeys?.find((key) => key.current)?.tenantSecretId;
        const previousKeyId = derivedKeys?.find((id) => id.tenantSecretId === parts.tenantSecretId)?.tenantSecretId;
        if (currentKeyId === undefined || previousKeyId === undefined) {
            return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_REKEY_FAILED, "Failed deterministic rekey."));
        } else {
            return Future.of(previousKeyId === currentKeyId);
        }
    });

/**
 * Decrypt the deterministically encrypted field using the associated tenant secrets contained in `derivedKeys`.
 * If `reencrypt` is true, return a failure if the field was already encrypted to the current tenant secret.
 */
export const decryptField = (
    encryptedField: DeterministicEncryptedField,
    derivedKeys: DerivedKey[] | undefined
): Future<TenantSecurityException, DeterministicPlaintextField> => {
    const decryptedFuture = decomposeField(encryptedField.encryptedField).flatMap((parts) => {
        const key = derivedKeys?.find((id) => id.tenantSecretId === parts.tenantSecretId);
        if (key === undefined) {
            return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_FIELD_DECRYPT_FAILED, "Failed deterministic decryption."));
        } else {
            return decryptBytes(parts.encryptedBytes, Buffer.from(key.derivedKey, "base64"));
        }
    });
    return decryptedFuture.map((decrypted) => ({
        plaintextField: decrypted,
        derivationPath: encryptedField.derivationPath,
        secretPath: encryptedField.secretPath,
    }));
};

/**
 * Deconstruct the provided encrypted field into its component parts. Separates the tenant secret ID, padding, and encrypted bytes.
 */
export const decomposeField = (encryptedBytesWithHeader: Buffer): Future<TenantSecurityException, DeterministicEncryptedFieldParts> => {
    const tenantSecretIdBytes = encryptedBytesWithHeader.slice(0, 4);
    const padding = encryptedBytesWithHeader.slice(4, 6);
    const encryptedBytes = encryptedBytesWithHeader.slice(6);
    if (Buffer.compare(padding, DETERMINISTIC_HEADER_PADDING) != 0) {
        return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_HEADER_ERROR, "Failed to parse field header."));
    }
    const tenantSecretId = tenantSecretIdBytes.readUInt32BE();
    return Future.of({encryptedBytes, tenantSecretId});
};

/**
 * Attempt to AES-SIV decrypt the provided bytes using the provided key.
 * associatedData is not used by our deterministic encryption, but is used in our unit tests of miscreant encryption.
 */
export const decryptBytes = (encryptedBytes: Buffer, key: Buffer, associatedData: Uint8Array[] = []): Future<TenantSecurityException, Buffer> => {
    return Future.tryP(() => miscreant.SIV.importKey(key, "AES-SIV", cryptoProvider))
        .flatMap((siv) => Future.tryP(() => siv.open(encryptedBytes, associatedData)).map((decrypted) => Buffer.from(decrypted)))
        .errorMap((e) => new TscException(TenantSecurityErrorCode.DETERMINISTIC_FIELD_DECRYPT_FAILED, e.message));
};

/**
 * Decrypt the provided deterministically encrypted field and re-encrypt it with the current tenant secret.
 */
export const rotateField = (
    encryptedDoc: DeterministicEncryptedField,
    derivedKeys: DerivedKey[] | undefined
): Future<TenantSecurityException, DeterministicEncryptedField> =>
    checkRotationFieldNoOp(encryptedDoc, derivedKeys).flatMap((noOp) => {
        if (noOp) {
            return Future.of(encryptedDoc);
        } else {
            return decryptField(encryptedDoc, derivedKeys).flatMap((decryptedDoc) => encryptField(decryptedDoc, derivedKeys));
        }
    });

/**
 * Deterministically encrypt the provided field with all current and in-rotation tenant secrets.
 */
export const generateSearchTerms = (
    field: DeterministicPlaintextField,
    derivedKeys: DerivedKey[] | undefined
): Future<TenantSecurityException, DeterministicEncryptedField[]> => {
    if (derivedKeys === undefined) {
        return Future.reject(new TscException(TenantSecurityErrorCode.DETERMINISTIC_SEARCH_FAILED, "Failed deterministic search."));
    }
    const futures = derivedKeys.map((key) => {
        const dekBytes = Buffer.from(key.derivedKey, "base64");
        return Future.gather2(generateEncryptedFieldHeader(key.tenantSecretId), encryptBytes(field.plaintextField, dekBytes)).map(([header, encryptedDoc]) =>
            Buffer.concat([header, encryptedDoc])
        );
    });
    return Future.all(futures).map((buffers) =>
        buffers.map((encrypted) => ({
            encryptedField: encrypted,
            derivationPath: field.derivationPath,
            secretPath: field.secretPath,
        }))
    );
};

/**
 * Helper function to perform a deterministic operation on a batch of fields, all sharing a single DeriveKeyResponse from the TSP.
 * The output of the provided `f` matches the output of this function.
 */
const batchCore = <I extends {secretPath: string; derivationPath: string}, O>(
    inputFields: Record<string, I>,
    derivedKeysResponse: DeriveKeyResponse,
    f: (input: I, derivedKeys: DerivedKey[] | undefined) => Future<TenantSecurityException, TenantSecurityException | O>
): Future<TenantSecurityException, Record<string, TenantSecurityException | O>> => {
    const reduceResult: Record<string, Future<TenantSecurityException, TenantSecurityException | O>> = {};
    const futuresMap = Object.entries(inputFields).reduce((currentMap, [fieldId, inputField]) => {
        const derivedKeys = getDerivedKeys(derivedKeysResponse, inputField.secretPath, inputField.derivationPath);
        if (derivedKeys === undefined) {
            const code = TenantSecurityErrorCode.UNKNOWN_ERROR;
            const message = "Failed to derive keys for field.";
            currentMap[fieldId] = Future.of(TenantSecurityExceptionUtils.from(code, message));
        } else {
            currentMap[fieldId] = f(inputField, derivedKeys).handleWith((e) => Future.of(e));
        }
        return currentMap;
    }, reduceResult);
    return Future.all(futuresMap);
};

export const batchEncryptField = (
    fields: DeterministicPlaintextFieldCollection,
    deriveResponse: DeriveKeyResponse
): Future<TenantSecurityException, BatchResult<DeterministicEncryptedField>> =>
    batchCore(fields, deriveResponse, encryptField).map<BatchResult<DeterministicEncryptedField>>(mapBatchOperationToResult);

export const batchDecryptField = (
    fields: DeterministicEncryptedFieldCollection,
    deriveResponse: DeriveKeyResponse
): Future<TenantSecurityException, BatchResult<DeterministicPlaintextField>> =>
    batchCore(fields, deriveResponse, decryptField).map<BatchResult<DeterministicPlaintextField>>(mapBatchOperationToResult);

export const batchRotateField = (
    fields: DeterministicEncryptedFieldCollection,
    deriveResponse: DeriveKeyResponse
): Future<TenantSecurityException, BatchResult<DeterministicEncryptedField>> =>
    batchCore(fields, deriveResponse, rotateField).map<BatchResult<DeterministicEncryptedField>>(mapBatchOperationToResult);

export const batchGenerateSearchTerms = (
    fields: DeterministicPlaintextFieldCollection,
    deriveResponse: DeriveKeyResponse
): Future<TenantSecurityException, BatchResult<DeterministicEncryptedField[]>> =>
    batchCore(fields, deriveResponse, generateSearchTerms).map<BatchResult<DeterministicEncryptedField[]>>(mapBatchOperationToResult);
