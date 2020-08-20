import Future from "futurejs";
import fetch, {Response} from "node-fetch";
import {Base64String} from "../../tenant-security-nodejs";
import {RequestMetadata} from "../RequestMetadata";
import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";

interface ApiErrorResponse {
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

export type BatchWrapKeyResponse = BatchResponse<WrapKeyResponse>;

interface UnwrapKeyResponse {
    dek: Base64String;
}

export type BatchUnwrapKeyResponse = BatchResponse<UnwrapKeyResponse>;

const WRAP_ENDPOINT = "document/wrap";
const UNWRAP_ENDPOINT = "document/unwrap";
const BATCH_WRAP_ENDPOINT = "document/batch-wrap";
const BATCH_UNWRAP_ENDPOINT = "document/batch-unwrap";

/**
 * Try to JSON parse error responses from the TSP to extract error codes and messages.
 */
const parseErrorFromFailedResponse = (failureResponse: Response) =>
    Future.tryP(() => failureResponse.json())
        .errorMap(() => new TenantSecurityClientException(ErrorCodes.UNKNOWN_ERROR, "Unknown response from Tenant Security Proxy", failureResponse.status))
        .flatMap((errorResp: ApiErrorResponse) => Future.reject(new TenantSecurityClientException(errorResp.code, errorResp.message, failureResponse.status)));

/**
 * Request the provided API endpoint with the provided POST data. All requests to the TSP today are in POST. On failure,
 * attempt to parse the failed JSON to extract an error code and message.
 */
const makeJsonRequest = <T>(tspDomain: string, apiKey: string, route: string, postData: string): Future<TenantSecurityClientException, T> =>
    Future.tryP(() =>
        fetch(`${tspDomain}/api/1/${route}`, {
            method: "POST",
            body: postData,
            headers: {
                "Content-Type": "application/json",
                Authorization: `cmk ${apiKey}`,
            },
        })
    )
        .errorMap((e) => new TenantSecurityClientException(ErrorCodes.UNABLE_TO_MAKE_REQUEST, e.message))
        .flatMap((response) => (response.ok ? Future.tryP(() => response.json()) : parseErrorFromFailedResponse(response)));

/**
 * Generate and wrap a new key via the tenant's KMS.
 */
export const wrapKey = (tspDomain: string, apiKey: string, metadata: RequestMetadata): Future<TenantSecurityClientException, WrapKeyResponse> =>
    makeJsonRequest(tspDomain, apiKey, WRAP_ENDPOINT, JSON.stringify(metadata.toJsonStructure()));

/**
 * Generate and wrap a collection of new KMS keys.
 */
export const batchWrapKeys = (
    tspDomain: string,
    apiKey: string,
    documentIds: string[],
    metadata: RequestMetadata
): Future<TenantSecurityClientException, BatchWrapKeyResponse> =>
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
    metadata: RequestMetadata
): Future<TenantSecurityClientException, UnwrapKeyResponse> =>
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
    metadata: RequestMetadata
): Future<TenantSecurityClientException, BatchUnwrapKeyResponse> =>
    makeJsonRequest(
        tspDomain,
        apiKey,
        BATCH_UNWRAP_ENDPOINT,
        JSON.stringify({
            ...metadata.toJsonStructure(),
            edeks,
        })
    );
