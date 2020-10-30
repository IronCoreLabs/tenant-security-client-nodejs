import {DocumentMetadata, TenantSecurityClient, TenantSecurityErrorCode, TenantSecurityException} from "../../index";

describe("UNIT TenantSecurityClient", () => {
    describe("constructor failures", () => {
        it("fails to construct when invalid arguments are provided", () => {
            expect(() => new TenantSecurityClient(undefined as any, undefined as any)).toThrow();
            expect(() => new TenantSecurityClient("", undefined as any)).toThrow();
            expect(() => new TenantSecurityClient("tspDomain", undefined as any)).toThrow();
            expect(() => new TenantSecurityClient("tspDomain", "")).toThrow();
            expect(() => new TenantSecurityClient("tspDomain", "apiKey")).not.toThrow();
        });
    });

    describe("failed request", () => {
        it("returns the expected error when we cant make an outgoing request", async () => {
            const client = new TenantSecurityClient("http://localhost:32112", "anyApiKey");

            const data = {foo: Buffer.from("anything", "utf-8")};
            const meta = new DocumentMetadata("tenantId", "nodejs-unit-test", "lipsum");

            try {
                await client.encryptDocument(data, meta);
                fail("Should fail when request to TSP fails");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST);
            }
        });
    });
});
