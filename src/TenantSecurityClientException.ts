export const ErrorCodes = {
    UNABLE_TO_MAKE_REQUEST: 0,
    UNKNOWN_ERROR: 100,
    UNAUTHORIZED_REQUEST: 101,
    INVALID_WRAP_BODY: 102,
    INVALID_UNWRAP_BODY: 103,
    NO_PRIMARY_KMS_CONFIGURATION: 200,
    UNKNOWN_TENANT_OR_NO_ACTIVE_KMS_CONFIGURATIONS: 201,
    KMS_CONFIGURATION_DISABLED: 202,
    INVALID_PROVIDED_EDEK: 203,
    KMS_WRAP_FAILED: 204,
    KMS_UNWRAP_FAILED: 205,
    KMS_AUTHORIZATION_FAILED: 206,
    KMS_CONFIGURATION_INVALID: 207,
    KMS_UNREACHABLE: 208,
    INVALID_ENCRYPTED_DOCUMENT: 300,
    DOCUMENT_ENCRYPT_FAILED: 301,
    DOCUMENT_DECRYPT_FAILED: 302,
};

export class TenantSecurityClientException extends Error {
    public errorCode: number;
    public httpResponseCode?: number;
    constructor(code: number, message: string, httpResponseCode?: number) {
        super(message);
        if (Object.values(ErrorCodes).includes(code)) {
            this.errorCode = code;
        } else {
            this.errorCode = ErrorCodes.UNKNOWN_ERROR;
        }
        this.httpResponseCode = httpResponseCode;
    }
}
