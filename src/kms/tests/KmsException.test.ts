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
});
