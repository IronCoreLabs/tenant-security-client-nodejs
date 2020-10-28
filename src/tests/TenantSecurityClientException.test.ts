import {TenantSecurityErrorCode, TspServiceException} from "../index";

describe("UNIT TenantSecurityException", () => {
    test("sets error to provided value", () => {
        const error = new TspServiceException(TenantSecurityErrorCode.INVALID_REQUEST_BODY, "fake error", 404);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.INVALID_REQUEST_BODY);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });

    test("falls back to unknown error if invalid error provided", () => {
        const error = new TspServiceException(353253, "fake error", 404);
        expect(error.errorCode).toEqual(TenantSecurityErrorCode.UNKNOWN_ERROR);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });
});
