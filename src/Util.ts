import Future from "futurejs";
import fetch, {Response} from "node-fetch";
import {ApiErrorResponse} from "./kms/KmsApi";
import {TenantSecurityErrorCode, TenantSecurityException} from "./TenantSecurityException";
import {TenantSecurityExceptionUtils} from "./TenantSecurityExceptionUtils";
import {TspServiceException} from "./TspServiceException";

/**
 * Try to JSON parse error responses from the TSP to extract error codes and messages.
 */
const parseErrorFromFailedResponse = (failureResponse: Response) =>
    Future.tryP(() => failureResponse.json())
        .errorMap(() => new TspServiceException(TenantSecurityErrorCode.UNKNOWN_ERROR, "Unknown response from Tenant Security Proxy", failureResponse.status))
        .flatMap((errorResp: ApiErrorResponse) => Future.reject(TenantSecurityExceptionUtils.from(errorResp.code, errorResp.message, failureResponse.status)));

/**
 * Request the provided API endpoint with the provided POST data. All requests to the TSP today are in POST. On failure,
 * attempt to parse the failed JSON to extract an error code and message.
 */
export const makeJsonRequest = <T>(tspDomain: string, apiKey: string, route: string, postData: string): Future<TenantSecurityException, T> =>
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
        .errorMap((e) => new TspServiceException(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST, e.message))
        .flatMap((response) => (response.ok ? Future.tryP(() => response.json()) : parseErrorFromFailedResponse(response)));

/**
 * Helper to remove undefined. Any is used explicitly here because what we're doing is outputting any minus undefined.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const clearUndefinedProperties = (obj: {[key: string]: any}): {[key: string]: Exclude<any, undefined>} => {
    const local = {...obj};
    Object.keys(local).forEach((key) => {
        if (local[key] === undefined) {
            delete local[key];
        } else if (typeof local[key] === "object") {
            clearUndefinedProperties(local[key]);
        }
    });
    return local;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

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
