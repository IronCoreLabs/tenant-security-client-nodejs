import {SecurityEventException, TenantSecurityErrorCode} from "../../index";

describe("UNIT SecurityEventException", () => {
    test("construction fails when an invalid code is provided", () => {
        expect(() => new SecurityEventException(TenantSecurityErrorCode.INVALID_PROVIDED_EDEK, "error message", 0)).toThrow();
    });
});
