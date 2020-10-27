import {TenantSecurityErrorCode, TenantSecurityException} from "../TenantSecurityException";

describe("UNIT TenantSecurityException", () => {
    test("sets error to provided value", () => {
        const error = new TenantSecurityException(TenantSecurityErrorCode.INVALID_REQUEST_BODY, "fake error", 404);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.INVALID_REQUEST_BODY);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });

    test("falls back to unknown error if invalid error provided", () => {
        const error = new TenantSecurityException(353253, "fake error", 404);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.UNKNOWN_ERROR);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });
});
