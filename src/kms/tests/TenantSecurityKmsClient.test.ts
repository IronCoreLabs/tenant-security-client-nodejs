import RequestMetadata from "../../RequestMetadata";
import {ErrorCodes, TenantSecurityClientException} from "../../TenantSecurityClientException";
import {TenantSecurityKmsClient} from "../TenantSecurityKmsClient";

describe("UNIT TenantSecurityKmsClient", () => {
    describe("constructor failures", () => {
        it("fails to construct when invalid arguments are provided", () => {
            expect(() => new TenantSecurityKmsClient(undefined as any, undefined as any)).toThrow();
            expect(() => new TenantSecurityKmsClient("", undefined as any)).toThrow();
            expect(() => new TenantSecurityKmsClient("tspDomain", undefined as any)).toThrow();
            expect(() => new TenantSecurityKmsClient("tspDomain", "")).toThrow();
            expect(() => new TenantSecurityKmsClient("tspDomain", "apiKey")).not.toThrow();
        });
    });

    describe("failed request", () => {
        it("returns the expected error when we cant make an outgoing request", async () => {
            const client = new TenantSecurityKmsClient("http://localhost:32112", "anyApiKey");

            const data = {foo: Buffer.from("anything", "utf-8")};
            const meta = new RequestMetadata("tenantId", "nodejs-unit-test", "lipsum");

            try {
                await client.encryptDocument(data, meta);
                fail("Should fail when request to TSP fails");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityClientException);
                expect(e.errorCode).toEqual(ErrorCodes.UNABLE_TO_MAKE_REQUEST);
            }
        });
    });
});
