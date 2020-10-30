import {KmsException} from "../kms/KmsException";
import {SecurityEventException} from "../security-events/SecurityEvent";
import {TenantSecurityErrorCode} from "../TenantSecurityException";
import {TenantSecurityExceptionUtils} from "../TenantSecurityExceptionUtils";
import {TscException} from "../TscException";
import {TspServiceException} from "../TspServiceException";

describe("UNIT TenantSecurityExceptionUtils", () => {
    test("from correctly creates an UNABLE_TO_MAKE_REQUEST.", () => {
        const exception = TenantSecurityExceptionUtils.from(0, "couldn't request", 0);
        expect(exception).toBeInstanceOf(TspServiceException);
        expect(exception.message).toBe("couldn't request");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST);
        expect(exception.httpResponseCode).toBe(0);
    });

    test("correctly handles TspServiceExceptions.", () => {
        const exception = TenantSecurityExceptionUtils.from(102, "");
        expect(exception).toBeInstanceOf(TspServiceException);
        expect(exception.message).toBe("");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.INVALID_REQUEST_BODY);
        expect(exception.httpResponseCode).toBeUndefined();
    });

    test("correctly handles KmsExceptions.", () => {
        const exception = TenantSecurityExceptionUtils.from(203, "");
        expect(exception).toBeInstanceOf(KmsException);
        expect(exception.message).toBe("");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.INVALID_PROVIDED_EDEK);
        expect(exception.httpResponseCode).toBeUndefined();
    });

    test("correctly handles SecurityEventExceptions.", () => {
        const exception = TenantSecurityExceptionUtils.from(301, "");
        expect(exception).toBeInstanceOf(SecurityEventException);
        expect(exception.message).toBe("");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.SECURITY_EVENT_REJECTED);
        expect(exception.httpResponseCode).toBeUndefined();
    });

    test("correctly handles TscExceptions.", () => {
        const exception = TenantSecurityExceptionUtils.from(901, "");
        expect(exception).toBeInstanceOf(TscException);
        expect(exception.message).toBe("");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.DOCUMENT_ENCRYPT_FAILED);
        expect(exception.httpResponseCode).toBeUndefined();
    });

    test("correctly handles unknown exception codes.", () => {
        const exception = TenantSecurityExceptionUtils.from(215, "");
        expect(exception).toBeInstanceOf(TspServiceException);
        expect(exception.message).toInclude("outside of recognized range");
        expect(exception.errorCode).toBe(TenantSecurityErrorCode.UNKNOWN_ERROR);
        expect(exception.httpResponseCode).toBeUndefined();
    });

    test("correctly handles wrong exception codes.", () => {
        const exception1 = TenantSecurityExceptionUtils.from(-66666666, "");
        expect(exception1).toBeInstanceOf(TspServiceException);
        expect(exception1.errorCode).toBe(TenantSecurityErrorCode.UNKNOWN_ERROR);
        expect(exception1.message).toInclude("outside of recognized range");
        expect(exception1.httpResponseCode).toBeUndefined();

        const exception2 = TenantSecurityExceptionUtils.from(66666666, "");
        expect(exception2).toBeInstanceOf(TspServiceException);
        expect(exception2.message).toInclude("outside of recognized range");
        expect(exception2.errorCode).toBe(TenantSecurityErrorCode.UNKNOWN_ERROR);
        expect(exception2.httpResponseCode).toBeUndefined();
    });
});
