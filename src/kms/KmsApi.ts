import Future from "futurejs";
import {TenantSecurityException} from "../TenantSecurityException";
import {Base64String, makeJsonRequest} from "../Util";
import {DocumentMetadata} from "./Metadata";
import Joi = require("joi");

export interface ApiErrorResponse {
    code: number;
    message: string;
}
export const ApiErrorResponseSchema = Joi.object({
    code: Joi.number().required(),
    message: Joi.string().required(),
}).unknown(true);

interface BatchResponse<T> {
    keys: Record<string, T>;
    failures: Record<string, ApiErrorResponse>;
}

export interface WrapKeyResponse {
    dek: Base64String;
    edek: Base64String;
}
export const WrapKeyResponseSchema = Joi.object({
    dek: Joi.string().required(),
    edek: Joi.string().required(),
}).unknown(true);

export type RekeyResponse = WrapKeyResponse;
export const RekeyResponseSchema = WrapKeyResponseSchema;

export type BatchWrapKeyResponse = BatchResponse<WrapKeyResponse>;
export const BatchWrapKeyResponseSchema = Joi.object({
    keys: Joi.object().pattern(Joi.string(), WrapKeyResponseSchema).required(),
    failures: Joi.object().pattern(Joi.string(), ApiErrorResponseSchema).required(),
}).unknown(true);

export interface UnwrapKeyResponse {
    dek: Base64String;
}
export const UnwrapKeyResponseSchema = Joi.object({
    dek: Joi.string().required(),
}).unknown(true);

export type BatchUnwrapKeyResponse = BatchResponse<UnwrapKeyResponse>;
export const BatchUnwrapKeyResponseSchema = Joi.object({
    keys: Joi.object().pattern(Joi.string(), UnwrapKeyResponseSchema).required(),
    failures: Joi.object().pattern(Joi.string(), ApiErrorResponseSchema).required(),
}).unknown(true);

export type DerivationPath = string;
export type SecretPath = string;

export interface DerivedKey {
    derivedKey: Base64String;
    tenantSecretId: number;
    current: boolean;
}
export const DerivedKeySchema = Joi.object({
    derivedKey: Joi.string().required(),
    tenantSecretId: Joi.number().required(),
    current: Joi.boolean().required(),
}).unknown(true);

export type DerivedKeys = Record<DerivationPath, DerivedKey[]>;

export const DerivedKeysSchema = Joi.object().pattern(Joi.string(), Joi.array().items(DerivedKeySchema));

export interface DeriveKeyResponse {
    hasPrimaryConfig: boolean;
    derivedKeys: Record<SecretPath, DerivedKeys>;
}
export const DeriveKeyResponseSchema = Joi.object({
    hasPrimaryConfig: Joi.boolean().required(),
    derivedKeys: Joi.object().pattern(Joi.string(), DerivedKeysSchema).required(),
}).unknown(true);

export const getDerivedKeys = (deriveKeyResponse: DeriveKeyResponse, secretPath: SecretPath, derivationPath: DerivationPath): DerivedKey[] | undefined =>
    deriveKeyResponse.derivedKeys[secretPath] === undefined ? undefined : deriveKeyResponse.derivedKeys[secretPath][derivationPath];

export const deterministicCollectionToPathMap = (
    fields: Record<string, {secretPath: SecretPath; derivationPath: DerivationPath}>
): Record<SecretPath, DerivationPath[]> => {
    return Object.values(fields).reduce(
        (currentMap, {derivationPath, secretPath}) => {
            if (currentMap[secretPath] === undefined) {
                currentMap[secretPath] = [derivationPath];
            } else {
                currentMap[secretPath].push(derivationPath);
            }
            return currentMap;
        },
        {} as Record<SecretPath, DerivationPath[]>
    );
};

enum DerivationType {
    Argon2 = "argon2",
    Sha256 = "sha256",
    Sha512 = "sha512",
}

enum SecretType {
    Search = "search",
    Deterministic = "deterministic",
}

const WRAP_ENDPOINT = "document/wrap";
const UNWRAP_ENDPOINT = "document/unwrap";
const BATCH_WRAP_ENDPOINT = "document/batch-wrap";
const BATCH_UNWRAP_ENDPOINT = "document/batch-unwrap";
const REKEY_ENDPOINT = "document/rekey";
const DERIVE_ENDPOINT = "key/derive-with-secret-path";

/**
 * Generate and wrap a new key via the tenant's KMS.
 */
export const wrapKey = (tspDomain: string, apiKey: string, metadata: DocumentMetadata): Future<TenantSecurityException, WrapKeyResponse> =>
    makeJsonRequest(tspDomain, apiKey, WRAP_ENDPOINT, JSON.stringify(metadata.toJsonStructure()), WrapKeyResponseSchema);

/**
 * Generate and wrap a collection of new KMS keys.
 */
export const batchWrapKeys = (
    tspDomain: string,
    apiKey: string,
    documentIds: string[],
    metadata: DocumentMetadata
): Future<TenantSecurityException, BatchWrapKeyResponse> =>
    makeJsonRequest(
        tspDomain,
        apiKey,
        BATCH_WRAP_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            documentIds,
        }),
        BatchWrapKeyResponseSchema
    );

/**
 * Take an EDEK and send it to the tenants KMS via the TSP to be unwrapped.
 */
export const unwrapKey = (
    tspDomain: string,
    apiKey: string,
    edek: Base64String,
    metadata: DocumentMetadata
): Future<TenantSecurityException, UnwrapKeyResponse> =>
    makeJsonRequest(
        tspDomain,
        apiKey,
        UNWRAP_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            encryptedDocumentKey: edek,
        }),
        UnwrapKeyResponseSchema
    );

/**
 * Take a collection of EDEKs and send them to the tenants KMS via the TSP to be unwrapped.
 */
export const batchUnwrapKey = (
    tspDomain: string,
    apiKey: string,
    edeks: Record<string, Base64String>,
    metadata: DocumentMetadata
): Future<TenantSecurityException, BatchUnwrapKeyResponse> =>
    makeJsonRequest(
        tspDomain,
        apiKey,
        BATCH_UNWRAP_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            edeks,
        }),
        BatchUnwrapKeyResponseSchema
    );

/**
 * Take an EDEK and send it to the tenant's KMS via the TSP to be unwrapped,
 * then send the key to the new tenant's KMS via the TSP to be wrapped.
 */
export const rekeyKey = (
    tspDomain: string,
    apiKey: string,
    edek: Base64String,
    newTenantId: string,
    metadata: DocumentMetadata
): Future<TenantSecurityException, RekeyResponse> =>
    makeJsonRequest(
        tspDomain,
        apiKey,
        REKEY_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            encryptedDocumentKey: edek,
            newTenantId,
        }),
        RekeyResponseSchema
    );

/**
 * Make a request to the TSP to derive keys for all of the requesting tenant's secrets using
 * the provided salts (derivation path) and secret path.
 */
export const deriveKey = (
    tspDomain: string,
    apiKey: string,
    paths: Record<SecretPath, DerivationPath[]>,
    metadata: DocumentMetadata
): Future<TenantSecurityException, DeriveKeyResponse> => {
    return makeJsonRequest(
        tspDomain,
        apiKey,
        DERIVE_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            paths,
            derivationType: DerivationType.Sha512,
            secretType: SecretType.Deterministic,
        }),
        DeriveKeyResponseSchema
    );
};
