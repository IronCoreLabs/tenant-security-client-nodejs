import {TenantSecurityErrorCode, TenantSecurityException} from "./TenantSecurityException";

/**
 * Represents exceptions that occur related to the TSP service but not specific to the operation taking place.
 */
export class TspServiceException extends TenantSecurityException {
    /**
     * Create a new TspServiceException with the provided error code and HTTP
     * status code.
     *
     * @param code             TSP generated code corresponding with this
     *                         error. @see TenantSecurityErrorCode for mapping.
     * @param message          The readable error message returned from the Tenant
     *                         Security Proxy for this error.
     * @param httpResponseCode The HTTP response code returned from the
     *                         Tenant Security Proxy for this error.
     */
    constructor(code: number, message: string, httpResponseCode?: number) {
        if (code < 0 || code > 199) {
            super(TenantSecurityErrorCode.UNKNOWN_ERROR, message, httpResponseCode);
        } else {
            super(code, message, httpResponseCode);
        }
    }
}
