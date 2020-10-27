import {TenantSecurityException} from "./TenantSecurityException";

/**
 * Represents exceptions that occur related to the TSP service but not specific to the operation taking place.
 */
export class TspServiceException extends TenantSecurityException {
    /**
     * Create a new TspServiceException with the provided error code and HTTP
     * status code.
     *
     * @param code             TSP generated code corresponding with this
     *                         error.
     * @param message          The readable error message returned from the Tenant
     *                         Security Proxy for this error.
     * @param httpResponseCode The HTTP response code returned from the
     *                         Tenant Security Proxy for this error.
     */
    constructor(code: number, message: string, httpResponseCode?: number) {
        super(code, message, httpResponseCode);
    }
}
