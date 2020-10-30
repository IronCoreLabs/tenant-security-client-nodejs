import {TenantSecurityErrorCode, TscException} from "../index";

describe("UNIT TscException", () => {
    test("construction succeeds when a valid code is provided", () => {
        expect(() => new TscException(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT, "error message")).not.toThrow();
        expect(new TscException(TenantSecurityErrorCode.DOCUMENT_DECRYPT_FAILED, "error message").errorCode).toEqual(
            TenantSecurityErrorCode.DOCUMENT_DECRYPT_FAILED
        );
    });

    test("construction fails when an invalid code is provided.", () => {
        expect(() => new TscException(TenantSecurityErrorCode.KMS_AUTHORIZATION_FAILED, "error message")).toThrow();
    });
});
