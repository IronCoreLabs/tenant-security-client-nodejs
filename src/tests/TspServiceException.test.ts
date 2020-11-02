import {TenantSecurityErrorCode, TspServiceException} from "../index";

describe("UNIT TspServiceException", () => {
    test("construction succeeds when a valid code is provided", () => {
        expect(() => new TspServiceException(TenantSecurityErrorCode.INVALID_REQUEST_BODY, "error message", 0)).not.toThrow();
        expect(new TspServiceException(TenantSecurityErrorCode.UNAUTHORIZED_REQUEST, "error message", 0).errorCode).toEqual(
            TenantSecurityErrorCode.UNAUTHORIZED_REQUEST
        );
    });

    test("construction succeeds when an invalid code is provided, but as an unknown error, since this is the catch all.", () => {
        expect(() => new TspServiceException(TenantSecurityErrorCode.KMS_AUTHORIZATION_FAILED, "error message", 0)).not.toThrow();
        expect(new TspServiceException(TenantSecurityErrorCode.KMS_AUTHORIZATION_FAILED, "error message", 0).errorCode).toEqual(
            TenantSecurityErrorCode.UNKNOWN_ERROR
        );
    });
});
