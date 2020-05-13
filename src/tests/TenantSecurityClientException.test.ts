import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";

describe("UNIT TenantSecurityClientException", () => {
    test("sets error to provided value", () => {
        const error = new TenantSecurityClientException(ErrorCodes.INVALID_UNWRAP_BODY, "fake error", 404);
        expect(error.errorCode).toEqual(ErrorCodes.INVALID_UNWRAP_BODY);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });

    test("falls back to unknown error if invalid error provided", () => {
        const error = new TenantSecurityClientException(353253, "fake error", 404);
        expect(error.errorCode).toEqual(ErrorCodes.UNKNOWN_ERROR);
        expect(error.httpResponseCode).toEqual(404);
        expect(error.message).toEqual("fake error");
    });
});
