/**
 ** 0 - 199   TspServiceException
 ** 200 - 299 KmsException
 ** 300 - 399 SecurityEventException
 ** 900 - 999 TscException
 */
export enum TenantSecurityErrorCode {
    // map to TspServiceException
    UNABLE_TO_MAKE_REQUEST = 0,
    UNKNOWN_ERROR = 100,
    UNAUTHORIZED_REQUEST = 101,
    INVALID_REQUEST_BODY = 102,

    // map to KmsException
    NO_PRIMARY_KMS_CONFIGURATION = 200,
    UNKNOWN_TENANT_OR_NO_ACTIVE_KMS_CONFIGURATIONS = 201,
    KMS_CONFIGURATION_DISABLED = 202,
    INVALID_PROVIDED_EDEK = 203,
    KMS_WRAP_FAILED = 204,
    KMS_UNWRAP_FAILED = 205,
    KMS_AUTHORIZATION_FAILED = 206,
    KMS_CONFIGURATION_INVALID = 207,
    KMS_UNREACHABLE = 208,
    KMS_THROTTLED = 209,
    KMS_ACCOUNT_ISSUE = 210,

    // map to SecurityEventException
    SECURITY_EVENT_REJECTED = 301,

    // map to TscException
    INVALID_ENCRYPTED_DOCUMENT = 900,
    DOCUMENT_ENCRYPT_FAILED = 901,
    DOCUMENT_DECRYPT_FAILED = 902,
    DETERMINISTIC_FIELD_ENCRYPT_FAILED = 903,
    DETERMINISTIC_FIELD_DECRYPT_FAILED = 904,
    DETERMINISTIC_HEADER_ERROR = 905,
    DETERMINISTIC_ROTATE_FAILED = 906,
    DETERMINISTIC_GENERATE_SEARCH_TERMS_FAILED = 907,
}

/**
 * Shared interface for all TSP related exceptions.
 */
export abstract class TenantSecurityException extends Error {
    public errorCode: TenantSecurityErrorCode;
    public httpResponseCode?: number;
    constructor(code: number, message: string, httpResponseCode?: number) {
        super(message);
        if (Object.values(TenantSecurityErrorCode).includes(code)) {
            this.errorCode = code;
        } else {
            this.errorCode = TenantSecurityErrorCode.UNKNOWN_ERROR;
        }
        this.httpResponseCode = httpResponseCode;
    }
}
