import {TenantSecurityException} from "../TenantSecurityException";

/**
 * Represents exceptions that occur related to KMS methods and endpoints.
 */
export class KmsException extends TenantSecurityException {
    /**
     * Create a new KmsException with the provided error code and HTTP
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
        if (code < 200 || code > 299) {
            throw new Error("KmsException constructed with code outside of recognized range.");
        }
        super(code, message, httpResponseCode);
    }
}
