import Future from "futurejs";
import fetch, {Response} from "node-fetch";
import {ApiErrorResponse} from "./kms/KmsApi";
import {KmsException} from "./kms/KmsException";
import {SecurityEventException} from "./security-events/SecurityEventException";
import {TenantSecurityErrorCode, TenantSecurityException} from "./TenantSecurityException";
import {TspServiceException} from "./TspServiceException";

/**
 * Try to JSON parse error responses from the TSP to extract error codes and messages.
 */
const parseErrorFromFailedResponse = (failureResponse: Response) =>
    Future.tryP(() => failureResponse.json())
        .errorMap(
            () => new TenantSecurityException(TenantSecurityErrorCode.UNKNOWN_ERROR, "Unknown response from Tenant Security Proxy", failureResponse.status)
        )
        .flatMap((errorResp: ApiErrorResponse) => {
            if (errorResp.code >= 0 && TenantSecurityErrorCode[errorResp.code] != null) {
                if (errorResp.code === 0) {
                    return Future.reject(new TspServiceException(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST, errorResp.message, failureResponse.status));
                } else if (errorResp.code >= 100 && errorResp.code < 199) {
                    return Future.reject(new TspServiceException(errorResp.code, errorResp.message, failureResponse.status));
                } else if (errorResp.code >= 200 && errorResp.code < 299) {
                    return Future.reject(new KmsException(errorResp.code, errorResp.message, failureResponse.status));
                } else if (errorResp.code >= 300 && errorResp.code < 399) {
                    return Future.reject(new SecurityEventException(errorResp.code, errorResp.message, failureResponse.status));
                } else {
                    return Future.reject(new TspServiceException(TenantSecurityErrorCode.UNKNOWN_ERROR, errorResp.message, failureResponse.status));
                }
            } else {
                return Future.reject(
                    new TspServiceException(TenantSecurityErrorCode.UNKNOWN_ERROR, "TSP status code outside of recognized range", failureResponse.status)
                );
            }
        });
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
        .errorMap((e) => new TenantSecurityException(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST, e.message))
        .flatMap((response) => (response.ok ? Future.tryP(() => response.json()) : parseErrorFromFailedResponse(response)));

/**
 * Helper to remove undefined. Any is used explicitly here because what we're doing is outputting any minus undefined.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const clearUndefinedProperties = (obj: {[key: string]: any}): {[key: string]: Exclude<any, undefined>} => {
    const local = {...obj};
    Object.keys(local).forEach((key) => local[key] === undefined && delete local[key]);
    return local;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
