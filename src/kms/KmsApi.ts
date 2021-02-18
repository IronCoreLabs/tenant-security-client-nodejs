import Future from "futurejs";
import {TenantSecurityException} from "../TenantSecurityException";
import {Base64String, makeJsonRequest} from "../Util";
import {DocumentMetadata} from "./DocumentMetadata";

export interface ApiErrorResponse {
    code: number;
    message: string;
}

interface BatchResponse<T> {
    keys: Record<string, T>;
    failures: Record<string, ApiErrorResponse>;
}

interface WrapKeyResponse {
    dek: Base64String;
    edek: Base64String;
}

export type RekeyResponse = WrapKeyResponse;

export type BatchWrapKeyResponse = BatchResponse<WrapKeyResponse>;

interface UnwrapKeyResponse {
    dek: Base64String;
}

export type BatchUnwrapKeyResponse = BatchResponse<UnwrapKeyResponse>;

const WRAP_ENDPOINT = "document/wrap";
const UNWRAP_ENDPOINT = "document/unwrap";
const BATCH_WRAP_ENDPOINT = "document/batch-wrap";
const BATCH_UNWRAP_ENDPOINT = "document/batch-unwrap";
const REKEY_ENDPOINT = "document/rekey";

/**
 * Generate and wrap a new key via the tenant's KMS.
 */
export const wrapKey = (tspDomain: string, apiKey: string, metadata: DocumentMetadata): Future<TenantSecurityException, WrapKeyResponse> =>
    makeJsonRequest(tspDomain, apiKey, WRAP_ENDPOINT, JSON.stringify(metadata.toJsonStructure()));

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
        })
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
        })
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
        })
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
        })
    );
