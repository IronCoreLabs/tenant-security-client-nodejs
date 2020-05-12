import "jest-extended";
import {EncryptedDocumentWithEdek} from "../../tenant-security-nodejs";
import {TenantSecurityKmsClient} from "../kms/TenantSecurityKmsClient";
import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";
import * as TestUtils from "./TestUtils";

const GCP_TENANT_ID = "INTEGRATION-TEST-DEV1-GCP";
const AWS_TENANT_ID = "INTEGRATION-TEST-DEV1-AWS";
const AZURE_TENANT_ID = "INTEGRATION-TEST-DEV1-AZURE";
const MULTIPLE_KMS_CONFIG_TENANT_ID = "INTEGRATION-TEST-DEV1-COMBO";
const INTEGRATION_API_KEY = "qlhqGW+Azctfy1ld";

describe("INTEGRATION dev environment tests", () => {
    let client: TenantSecurityKmsClient;

    beforeEach(() => {
        client = new TenantSecurityKmsClient("http://localhost:7777", INTEGRATION_API_KEY);
    });

    describe("roundtrip encrypt and decrypt", () => {
        it("roundtrips a collection of fields in GCP", async () => {
            await TestUtils.runSingleDocumentRoundTripForTenant(client, GCP_TENANT_ID);
            await TestUtils.runSingleExistingDocumentRoundTripForTenant(client, GCP_TENANT_ID);
        });

        it("roundtrips a collection of fields in AWS", async () => {
            await TestUtils.runSingleDocumentRoundTripForTenant(client, AWS_TENANT_ID);
            await TestUtils.runSingleExistingDocumentRoundTripForTenant(client, AWS_TENANT_ID);
        });

        it("roundtrips a collection of fields in Azure", async () => {
            await TestUtils.runSingleDocumentRoundTripForTenant(client, AZURE_TENANT_ID);
            await TestUtils.runSingleExistingDocumentRoundTripForTenant(client, AZURE_TENANT_ID);
        });
    });

    describe("roundtrip batch encrypt and batch decrypt", () => {
        it("should roundtrip batch documents in GCP", async () => {
            await TestUtils.runBatchDocumentRoundtripForTenant(client, GCP_TENANT_ID);
            await TestUtils.runReusedBatchDocumentRoundtripForTenant(client, GCP_TENANT_ID);
        });

        it("should roundtrip batch documents in AWS", async () => {
            await TestUtils.runBatchDocumentRoundtripForTenant(client, AWS_TENANT_ID);
            await TestUtils.runReusedBatchDocumentRoundtripForTenant(client, AWS_TENANT_ID);
        });

        it("should roundtrip batch documents in Azure", async () => {
            await TestUtils.runBatchDocumentRoundtripForTenant(client, AZURE_TENANT_ID);
            await TestUtils.runReusedBatchDocumentRoundtripForTenant(client, AZURE_TENANT_ID);
        });
    });

    describe("test tenant with multiple configs", () => {
        it("fails to encrypt new data with no primary config", async () => {
            const data = TestUtils.getDataToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await client.encryptDocument(data, meta);
                expect.fail("Should fail because tenant has no primary KMS config");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityClientException);
                expect(e.errorCode).toEqual(ErrorCodes.NO_PRIMARY_KMS_CONFIGURATION);
            }
        });

        it("fails to decrypt data from disabled config", async () => {
            //prettier-ignore
            const existingEncryptedDataForDisabledConfig = Buffer.from([3, 73, 82, 79, 78, 0, 0, -77, 108, 93, -13, -20, -69, 116, -17, -41, 107, 49, 56, -8, 109, 105, 107, -108, 4, 2, -50, 21, -127, -124, 69, 34, 78, 84, 56, 101, -98, 126, -79, 46, 65, 91, 95, 66, -111, 8]);
            //prettier-ignore
            const existingEdekForDisabledConfig = "CoYCCoACi6JH7ZOggHm0fyIsUc4jVvK0jgPfn1V76xfVxYfBLP7QbfeZD7Gyzj4Xxdj4upJ7grzjCe8ydK3Q6ijeBOt7b050BhUHRsHUgdV7zBGWvaZOhPQ4sYl5bFVcefyQyk7EeN/qd6RGYq9AHEcBTzgx+Nw83Jgr34SPHSbTkhUIIJTzt0NAwJsQ7ZYMv2NHQ1LdjItr8/mJsu9i5R6yd3p2fuKWJozeAPHp9Salc9Vr5uwfGZsAKHNkbDlYvXFs6bO7TV2T2fOmevln2Yi/UEq6RqFa2FmzJMqVxeAbMNpCJ0KlcjqsI4cOD4VjotiXu4umTsMCIkN7I5KCZHKG3Bo+1xDwAw==";

            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const data: EncryptedDocumentWithEdek = {edek: existingEdekForDisabledConfig, encryptedDocument: {doc: existingEncryptedDataForDisabledConfig}};

            try {
                await client.decryptDocument(data, meta);
                expect.fail("Decrypt should fail because KMS config was disabled");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityClientException);
                expect(e.errorCode).toEqual(ErrorCodes.KMS_CONFIGURATION_DISABLED);
            }
        });

        it("successfully decrypts data from non-primary but active config", async () => {
            //prettier-ignore
            const existingEncryptedDataForEnabledConfig = Buffer.from([3, 73, 82, 79, 78, 0, 0, 85, -104, 85, -101, -61, 2, 66, 122, 89, -118, 55, 101, -89, 79, -5, 115, 82, 77, 0, 55, 29, -14, -48, -59, 11, 63, -126, -62, 107, -85, 88, -45, -89, 88, 19, 6, -50, 112, -101 ]);
            //prettier-ignore
            const existingEdekForEnabledConfig = "Cr4BCrgBAQIDAHj0ZREHq1bONJuR5ImNOlC8TTbXrFSZ5ETcue/j52IG8AFHigXyTIDryqdkPfVVMC2yAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMGTmWho89vfNOIdymAgEQgDvJnGyaDKgcFGNz3s+TPpZl0eVOYu9Ex4Ym0J7xXO8hlx0QSgvzp+AppxbxHIzTN/weT5fibfSw3yZybRDvAw==";

            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const data: EncryptedDocumentWithEdek = {edek: existingEdekForEnabledConfig, encryptedDocument: {doc: existingEncryptedDataForEnabledConfig}};

            const decryptResult = await client.decryptDocument(data, meta);

            expect(decryptResult.edek).toEqual(existingEdekForEnabledConfig);
            expect(decryptResult.plaintextDocument.doc.toString("utf-8")).toEqual("Wont happen");
        });

        it("fails to decrypt data from an unknown tenant", async () => {
            const data = TestUtils.getDataToEncrypt();
            const meta = TestUtils.getMetadata("unknownTenant");

            try {
                await client.encryptDocument(data, meta);
                expect.fail("Should fail because tenant has no primary KMS config");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityClientException);
                expect(e.errorCode).toEqual(ErrorCodes.UNKNOWN_TENANT_OR_NO_ACTIVE_KMS_CONFIGURATIONS);
            }
        });
    });
});
