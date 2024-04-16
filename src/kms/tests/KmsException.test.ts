import {KmsException, TenantSecurityErrorCode} from "../../index";

describe("UNIT KmsException", () => {
    test("construction succeeds when a valid code is provided", () => {
        expect(() => new KmsException(TenantSecurityErrorCode.KMS_AUTHORIZATION_FAILED, "error message", 0)).not.toThrow();
        expect(new KmsException(TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED, "error message", 0).errorCode).toEqual(
            TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED
        );
    });

    test("construction fails when an invalid code is provided", () => {
        expect(() => new KmsException(TenantSecurityErrorCode.DOCUMENT_DECRYPT_FAILED, "error message", 0)).toThrow();
    });

    test("Understands error 209", () => {
        const error = new KmsException(209, "totally real error message.", 429);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.KMS_THROTTLED);
        expect(error.httpResponseCode).toEqual(429);
        expect(error.message).toEqual("totally real error message.");
    });

    test("Understands error 210", () => {
        const error = new KmsException(210, "totally real error message.", 429);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.KMS_ACCOUNT_ISSUE);
        expect(error.httpResponseCode).toEqual(429);
        expect(error.message).toEqual("totally real error message.");
    });
});
