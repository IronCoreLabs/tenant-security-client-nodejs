import {SecurityEventException, TenantSecurityErrorCode} from "../../index";

describe("UNIT SecurityEventException", () => {
    test("construction succeeds when a valid code is provided", () => {
        expect(() => new SecurityEventException(TenantSecurityErrorCode.SECURITY_EVENT_REJECTED, "error message", 0)).not.toThrow();
        expect(new SecurityEventException(TenantSecurityErrorCode.SECURITY_EVENT_REJECTED, "error message", 0).errorCode).toEqual(
            TenantSecurityErrorCode.SECURITY_EVENT_REJECTED
        );
    });
    test("construction fails when an invalid code is provided", () => {
        expect(() => new SecurityEventException(TenantSecurityErrorCode.INVALID_PROVIDED_EDEK, "error message", 0)).toThrow();
    });
});
