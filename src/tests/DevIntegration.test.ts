import * as fs from "fs";
import "jest-extended";
import {EncryptedDocumentWithEdek} from "../../tenant-security-nodejs";
import {TenantSecurityClient} from "../kms/TenantSecurityClient";
import {TenantSecurityErrorCode, TenantSecurityException} from "../TenantSecurityException";
import * as TestUtils from "./TestUtils";

const GCP_TENANT_ID = "INTEGRATION-TEST-DEV1-GCP";
const AWS_TENANT_ID = "INTEGRATION-TEST-DEV1-AWS";
const AZURE_TENANT_ID = "INTEGRATION-TEST-DEV1-AZURE";
const MULTIPLE_KMS_CONFIG_TENANT_ID = "INTEGRATION-TEST-DEV1-COMBO";
const INTEGRATION_API_KEY = "qlhqGW+Azctfy1ld";

//prettier-ignore
const existingEncryptedDataForEnabledConfig = Buffer.from([3, 73, 82, 79, 78, 0, 0, 85, -104, 85, -101, -61, 2, 66, 122, 89, -118, 55, 101, -89, 79, -5, 115, 82, 77, 0, 55, 29, -14, -48, -59, 11, 63, -126, -62, 107, -85, 88, -45, -89, 88, 19, 6, -50, 112, -101 ]);
//prettier-ignore
const existingEdekForEnabledConfig = "Cr4BCrgBAQIDAHj0ZREHq1bONJuR5ImNOlC8TTbXrFSZ5ETcue/j52IG8AFHigXyTIDryqdkPfVVMC2yAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMGTmWho89vfNOIdymAgEQgDvJnGyaDKgcFGNz3s+TPpZl0eVOYu9Ex4Ym0J7xXO8hlx0QSgvzp+AppxbxHIzTN/weT5fibfSw3yZybRDvAw==";
//prettier-ignore
const existingEncryptedDataForDisabledConfig = Buffer.from([3, 73, 82, 79, 78, 0, 0, -77, 108, 93, -13, -20, -69, 116, -17, -41, 107, 49, 56, -8, 109, 105, 107, -108, 4, 2, -50, 21, -127, -124, 69, 34, 78, 84, 56, 101, -98, 126, -79, 46, 65, 91, 95, 66, -111, 8]);
//prettier-ignore
const existingEdekForDisabledConfig = "CoYCCoACi6JH7ZOggHm0fyIsUc4jVvK0jgPfn1V76xfVxYfBLP7QbfeZD7Gyzj4Xxdj4upJ7grzjCe8ydK3Q6ijeBOt7b050BhUHRsHUgdV7zBGWvaZOhPQ4sYl5bFVcefyQyk7EeN/qd6RGYq9AHEcBTzgx+Nw83Jgr34SPHSbTkhUIIJTzt0NAwJsQ7ZYMv2NHQ1LdjItr8/mJsu9i5R6yd3p2fuKWJozeAPHp9Salc9Vr5uwfGZsAKHNkbDlYvXFs6bO7TV2T2fOmevln2Yi/UEq6RqFa2FmzJMqVxeAbMNpCJ0KlcjqsI4cOD4VjotiXu4umTsMCIkN7I5KCZHKG3Bo+1xDwAw==";

describe("INTEGRATION dev environment tests", () => {
    let client: TenantSecurityClient;

    beforeEach(() => {
        client = new TenantSecurityClient("http://localhost:7777", INTEGRATION_API_KEY);
    });

    describe("verify encrypted bytes", () => {
        it("fails to decrypt when provided encrypted bytes are not CMK bytes", async () => {
            const randomBytes = Buffer.from("randomBytes", "utf-8");
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await client.decryptDocument({edek: existingEdekForEnabledConfig, encryptedDocument: {bs: randomBytes}}, meta);
                fail("Should not be able to decrypt BS data");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT);
            }
        });

        it("fails when provided EDEK is BS", async () => {
            const randomBytes = Buffer.from("randomBytes", "utf-8");
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await client.decryptDocument({edek: randomBytes.toString("base64"), encryptedDocument: {bs: existingEncryptedDataForEnabledConfig}}, meta);
                fail("Should not be able to decrypt BS data");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.INVALID_PROVIDED_EDEK);
            }
        });
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

    describe("roundtrip streaming encrypt and decrypt", () => {
        let inputFilePath = `${__dirname}/test.txt`;
        let outputFilePath = `${__dirname}/test.txt.enc`;
        let roundtripFilePath = `${__dirname}/roundtrip.txt`;
        beforeEach(() => {
            fs.appendFileSync(inputFilePath, "content to be encrypted");
            fs.appendFileSync(outputFilePath, "");
        });

        afterEach(() => {
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
            if (fs.existsSync(roundtripFilePath)) {
                fs.unlinkSync(roundtripFilePath);
            }
        });

        it("roundtrips streaming in and writing out to a file", async () => {
            const plaintextStream = fs.createReadStream(inputFilePath);
            const ciphertextOutputStream = fs.createWriteStream(outputFilePath);

            const streamEncryptRes = await client.encryptStream(plaintextStream, ciphertextOutputStream, TestUtils.getMetadata(GCP_TENANT_ID));

            const cipherTextInputStream = fs.createReadStream(outputFilePath);
            const roundtripFileStream = fs.createWriteStream(roundtripFilePath);

            await client.decryptStream(streamEncryptRes.edek, cipherTextInputStream, roundtripFileStream, TestUtils.getMetadata(GCP_TENANT_ID));

            const roundTripContent = fs.readFileSync(roundtripFilePath, "utf-8");

            expect(roundTripContent).toEqual("content to be encrypted");
        });

        it("roundtrips encrypting a file without streaming and then decrypting that file with streaming", async () => {
            //Encrypt a doc using the normal encrypt and write it to the output file
            const encryptRes = await client.encryptDocument({foo: Buffer.from("encrypted without streaming", "utf-8")}, TestUtils.getMetadata(GCP_TENANT_ID));
            fs.writeFileSync(outputFilePath, encryptRes.encryptedDocument.foo);

            const cipherTextInputStream = fs.createReadStream(outputFilePath);
            const roundtripFileStream = fs.createWriteStream(roundtripFilePath);

            await client.decryptStream(encryptRes.edek, cipherTextInputStream, roundtripFileStream, TestUtils.getMetadata(GCP_TENANT_ID));

            const roundTripContent = fs.readFileSync(roundtripFilePath, "utf-8");

            expect(roundTripContent).toEqual("encrypted without streaming");
        });

        it("doesnt write to output file if wrong DEK is used", async () => {
            const otherEncrypt = await client.encryptDocument({foo: Buffer.from("bar", "utf-8")}, TestUtils.getMetadata(GCP_TENANT_ID));
            const otherEdek = otherEncrypt.edek;

            const plaintextStream = fs.createReadStream(inputFilePath);
            const ciphertextOutputStream = fs.createWriteStream(outputFilePath);

            //Encrypt, but throw away the resulting EDEK since we want to try our own
            await client.encryptStream(plaintextStream, ciphertextOutputStream, TestUtils.getMetadata(GCP_TENANT_ID));

            const cipherTextInputStream = fs.createReadStream(outputFilePath);
            const roundtripFileStream = fs.createWriteStream(roundtripFilePath);

            try {
                await client.decryptStream(otherEdek, cipherTextInputStream, roundtripFileStream, TestUtils.getMetadata(GCP_TENANT_ID));
                fail("Should fail when provided EDEK is invalid");
            } catch (e) {
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.DOCUMENT_DECRYPT_FAILED);
                //When using the wrong EDEK, we shouldn't write any file content
                expect(fs.readFileSync(roundtripFilePath, "utf-8")).toEqual("");
            }
        });

        it("attempts to write to output file if DEK is correct but original file is corrupt", async () => {
            const plaintextStream = fs.createReadStream(inputFilePath);
            const ciphertextOutputStream = fs.createWriteStream(outputFilePath);
            const streamEncryptRes = await client.encryptStream(plaintextStream, ciphertextOutputStream, TestUtils.getMetadata(GCP_TENANT_ID));
            //Write some garbage at the end of the encrypted file which will mess up the GCM auth tag
            fs.appendFileSync(outputFilePath, Buffer.from([35, 91, 38, 98, 35]));
            const cipherTextInputStream = fs.createReadStream(outputFilePath);
            const roundtripFileStream = fs.createWriteStream(roundtripFilePath);
            try {
                await client.decryptStream(streamEncryptRes.edek, cipherTextInputStream, roundtripFileStream, TestUtils.getMetadata(GCP_TENANT_ID));
                fail("Should fail when encrypted data is invalid");
            } catch (e) {
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.DOCUMENT_DECRYPT_FAILED);
                //Some amount of bytes should have been written
                expect(fs.readFileSync(roundtripFilePath, "utf-8")).not.toEqual("");
            }
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
                fail("Should fail because tenant has no primary KMS config");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.NO_PRIMARY_KMS_CONFIGURATION);
            }
        });

        it("fails when batch encrypt with no primary config", async () => {
            const data = TestUtils.getDataToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await await client.encryptDocumentBatch({fail: data}, meta);
                fail("Should fail because tenant has no primary KMS config");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.NO_PRIMARY_KMS_CONFIGURATION);
            }
        });

        it("fails to decrypt data from disabled config", async () => {
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const data: EncryptedDocumentWithEdek = {edek: existingEdekForDisabledConfig, encryptedDocument: {doc: existingEncryptedDataForDisabledConfig}};

            try {
                await client.decryptDocument(data, meta);
                fail("Decrypt should fail because KMS config was disabled");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED);
            }
        });

        it("successfully decrypts data from non-primary but active config", async () => {
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const data: EncryptedDocumentWithEdek = {edek: existingEdekForEnabledConfig, encryptedDocument: {doc: existingEncryptedDataForEnabledConfig}};

            const decryptResult = await client.decryptDocument(data, meta);

            expect(decryptResult.edek).toEqual(existingEdekForEnabledConfig);
            expect(decryptResult.plaintextDocument.doc.toString("utf-8")).toEqual("Wont happen");
        });

        it("successfuly re-encrypts with EDEK from active config", async () => {
            const data = TestUtils.getDataToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            const reEncryptResult = await client.encryptDocumentWithExistingKey({edek: existingEdekForEnabledConfig, plaintextDocument: data}, meta);

            expect(reEncryptResult.edek).toEqual(existingEdekForEnabledConfig);
            TestUtils.assertEncryptedData(client, reEncryptResult.encryptedDocument);
        });

        it("supports partial failure when reencrypting existing batch", async () => {
            const data = {
                good: {
                    edek: existingEdekForEnabledConfig,
                    plaintextDocument: TestUtils.getDataToEncrypt(),
                },
                bad: {
                    edek: existingEdekForDisabledConfig,
                    plaintextDocument: TestUtils.getDataToEncrypt(),
                },
            };
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            const batchReEncryptResult = await client.encryptDocumentBatchWithExistingKey(data, meta);

            expect(batchReEncryptResult.hasFailures).toBeTrue();
            expect(batchReEncryptResult.hasSuccesses).toBeTrue();
            expect(batchReEncryptResult.successes.good.edek).toEqual(existingEdekForEnabledConfig);
            TestUtils.assertEncryptedData(client, batchReEncryptResult.successes.good.encryptedDocument);

            expect(batchReEncryptResult.failures.bad).toBeInstanceOf(TenantSecurityException);
            expect(batchReEncryptResult.failures.bad.errorCode).toEqual(TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED);
        });

        it("fails to decrypt data from an unknown tenant", async () => {
            const data = TestUtils.getDataToEncrypt();
            const meta = TestUtils.getMetadata("unknownTenant");

            try {
                await client.encryptDocument(data, meta);
                fail("Should fail because tenant has no primary KMS config");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.UNKNOWN_TENANT_OR_NO_ACTIVE_KMS_CONFIGURATIONS);
            }
        });

        it("supports partial failure on batch decrypt", async () => {
            const data = {
                good: {
                    edek: existingEdekForEnabledConfig,
                    encryptedDocument: {bytes: existingEncryptedDataForEnabledConfig},
                },
                bad: {
                    edek: existingEdekForDisabledConfig,
                    encryptedDocument: {bytes: existingEncryptedDataForDisabledConfig},
                },
            };
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const batchDecryptResult = await client.decryptDocumentBatch(data, meta);

            expect(batchDecryptResult.hasFailures).toBeTrue();
            expect(batchDecryptResult.hasSuccesses).toBeTrue();
            expect(batchDecryptResult.successes.good.edek).toEqual(existingEdekForEnabledConfig);
            expect(batchDecryptResult.successes.good.plaintextDocument.bytes.toString("utf-8")).toEqual("Wont happen");

            expect(batchDecryptResult.failures.bad).toBeInstanceOf(TenantSecurityException);
            expect(batchDecryptResult.failures.bad.errorCode).toEqual(TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED);
        });
    });

    describe("test Azure key version protobuf", () => {
        const azureEdekWithoutVersion =
            "CoYECoAEAaEuAPmN/WgeyhLO1g5uS15GXI/AWikYhcPL1aUQlDlwCw+t1eRJOW6y9/4VKac4rcriDYSRGib5lq60cT+Blfeo/oSd1Te2SKh9ho+vOxqzHOS5uC0jSz5mvoGbZM+C7ZIE0xbJO5vZPP6XcYY+akpu+XnhaaPtYQywtbP24B4V1+w2tSOFHNZfokHwS5aamS4d0rt2EQntuwlJDUX7cKyxrC4Lr1pRoK9uAeQsKvKcqGw8FiJ+zQ3VVQ10yt5QURP4Ob45PDo9vOntCdJaD1Tw+SCFGMPO2yubYYa+XgfgFm21mwcXstzKdEJiBnICxRsH8izXN0qPNGw4f7W4PGMrhkSrlcs32+iQI9YNPHJ81C/B1cFGlFA8TvVspebhGvIjlCxc1OkR2ghysk/eNvsGbKO1VeV2emCztA4C7j3jkYmQD8TOqx2sqO+zVOxFpC5OrOgb43LwI1lDHZkvNsuSBUoUI6C+xwZYFbk8H0+aF20KUA9KL9FQsox3mDkha598gd4Zpa0YQlmc2kVkOv3wJR+7wqajke/dmKpQk8FdD+THSi+LgZ2efEc/xCSSwiaRBe3g1z/p1jrQy8ABAsk3OSfufxgqg9JMB+aOusWAm5fSJ2xQmIVbtv2adsLnl7kLpDTnAzhbgqocK2JdN0H1pQWmKGkzPMrsa+tPjpYQ7gM=";
        const azureEncryptedDataForEdekWithoutVersion = Buffer.from(
            "A0lST04APQocNyeUf2nJv1Rs3SmIOw4JmlPNvigJ4Kbq2DH6WhodChtJTlRFR1JBVElPTi1URVNULURFVjEtQVpVUkWGq2ocw72wK2/vR62iBWVrL4g32AndOSZvPVgtb/qNQYn4biKX4mODtA==",
            "base64"
        );
        const meta = TestUtils.getMetadata(AZURE_TENANT_ID);

        it("decrypts EDEK which doesnt have an Azure key version", async () => {
            const decrypt = await client.decryptDocument(
                {encryptedDocument: {foo: azureEncryptedDataForEdekWithoutVersion}, edek: azureEdekWithoutVersion},
                meta
            );

            expect(decrypt.edek).toEqual(azureEdekWithoutVersion);
            expect(decrypt.plaintextDocument.foo.toString("utf-8")).toEqual("whatever data");
        });

        it("fails with expected error when edek looks like protobuf, but isnt", async () => {
            //This is an Azure key that was generated before we added the additional wrapper of protobuf to store the Azure key version. However, this key
            //still successfully decodes as an empty protobuf object somehow which was causing failures. This test verifies that we get the proper error back,
            //namely that the key passed to Azure was invalid (because it's not a key we can decrypt, we got it from somewhere else) and not the error that
            //says that we didn't pass a key to Azure at all.
            const hackedAzureEdek =
                "CoYCCoACMmiUBYFpypz6j0cLsIxK5JDHJAvw3uNy4ORmi+8pd5cDbfXGjDajR9U+stXoAKUQP6N3luQFJY3SXhX9w2+8d/vqlhj8zBXj1Zum16iznhl0w24sZIbZj9ar9yCvYmBNrErAVxL31MQYFSFGZjsxAVwLmM1wQI2wAyp7nHrV+f3mNLFF9depEvxhW98aI8SrpV+x4gAeVlfFh4CuhGroGVXfaCIHLQaR+Q3XyYB0OfL882XZSHuRggb77rccjdIZUgjkokKKhEaH0ac0Ylbktj/7x0msiK0nwgSLjnPfkxm4e5PCTc22VD/eFoYQ1jfzuSOOqzSMSKIPYA4l8dFHdxDuAw==";
            const meta = TestUtils.getMetadata(AZURE_TENANT_ID);

            try {
                await client.decryptDocument({encryptedDocument: {foo: azureEncryptedDataForEdekWithoutVersion}, edek: hackedAzureEdek}, meta);
            } catch (e) {
                expect(e.message).toContain("Failed to unwrap key via Azure");
                expect(e.message).toContain("The parameter is incorrect");
                expect(e.message).not.toContain("Propery 'value' is required");
            }
        });
    });

    describe("decrypted previously leased data", () => {
        //Verify that we can decrypt data that was encrypted when the configuration had leasing enabled. To generate this data I encrypted some data when
        //leasing was turned off (nonLeasedDocument) and another document when leasing was turned on (leasedDocument). Then leasing was disabled again. This
        //test verifies that the leased document can still be decrypted and that we have access to the leased data.
        const nonLeasedDocument = {
            edek:
                "CnYKcQokABW+8GeAPN90zTPKLMenLeWmyr0pmGLqmsmhweoPO9ImxYEiEkkAs0w57pQIOcehVWROISlIn+g9kYlgO5uAEvtVc3SbLgwl7Wkf4UBYpSYZXrx7Lt8BGQYHbPx8DqZiGhc+A+5rK2KM/lD5AurtEOwD",
            data:
                "A0lST04AOwocmH4+bD5DF0vJpruj8OK+3TNsIUzWfre2tzchyhobChlJTlRFR1JBVElPTi1URVNULURFVjEtR0NQ00asS3TWHsT19WSBmsFY5tv18HwlQVAy1Mv8sMLSlBDPfTvDF0c=",
        };

        const leasedDocument = {
            edek:
                "Cr8BCjA7nnuAiXpD0Jkjc6mOBgcSyxcjFYX813WQhhYg0oKnsDJTmeyAaLs3t9pzkR6mU9cQ7AMY3gQiDCEN6aQFtglBZ0DX7yp3CnUKcAokABW+8Gfu/FSC8WQTqxw528aQXwrpvY0MjlHurZJ6yHx9S/2zEkgAs0w57oTuIHzVmauLGDi/S9zCQH20dezcc/jtw/nqCDnAtAPSB9m17YvGOVpN5xO8960C86NA4AJCoVJ291YW9OkIKto48/YQ7AM=",
            data:
                "A0lST04AOwocjKi8E65AAxBCqUjeSqQDc7veZVQehempBfsABBobChlJTlRFR1JBVElPTi1URVNULURFVjEtR0NQbZ+1yhYOoCNdtV+VVTMTUfAQm1FdqtGyjqeE7iYxfW9TKwTc2C0=",
        };

        it("can still decrypted non-leased document", async () => {
            const data = {
                foo: Buffer.from(nonLeasedDocument.data, "base64"),
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);

            const {plaintextDocument} = await client.decryptDocument({edek: nonLeasedDocument.edek, encryptedDocument: data}, meta);

            expect(plaintextDocument.foo.toString("utf8")).toEqual("new daters");
        });

        it("leased document", async () => {
            const data = {
                foo: Buffer.from(leasedDocument.data, "base64"),
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);

            const {plaintextDocument} = await client.decryptDocument({edek: leasedDocument.edek, encryptedDocument: data}, meta);

            expect(plaintextDocument.foo.toString("utf8")).toEqual("new daters");
        });
    });
});
