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
