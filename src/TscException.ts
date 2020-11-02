import {TenantSecurityException} from "./TenantSecurityException";

/**
 * Represents exceptions that occur in the client.
 */
export class TscException extends TenantSecurityException {
    /**
     * Create a new TscException with the provided error code and message.
     *
     * @param code             TSC generated code corresponding with this
     *                         error. @see TenantSecurityErrorCode for mapping.
     * @param message          The readable error message returned by whatever failed in the TSC.
     */
    constructor(code: number, message: string) {
        if (code < 900 || code > 999) {
            throw new Error("TscException constructed with code outside of recognized range.");
        }
        super(code, message);
    }
}
