import * as fs from "fs";
import "jest-extended";
import {TenantSecurityClient, TenantSecurityErrorCode, TenantSecurityException} from "../index";
import {EventMetadata} from "../logdriver/EventMetadata";
import {UserEvent} from "../logdriver/UserEvent";
import {TscException} from "../TscException";
import {EncryptedDocumentWithEdek} from "../Util";
import * as TestUtils from "./TestUtils";
import {DeterministicTenantSecurityClient} from "../kms/DeterministicTenantSecurityClient";

const GCP_TENANT_ID = "INTEGRATION-TEST-GCP";
const AWS_TENANT_ID = "INTEGRATION-TEST-AWS";
const AZURE_TENANT_ID = "INTEGRATION-TEST-AZURE";
const MULTIPLE_KMS_CONFIG_TENANT_ID = "INTEGRATION-TEST-COMBO";
const INTEGRATION_API_KEY = process.env.API_KEY ?? "";

//prettier-ignore
const existingEncryptedDataForEnabledConfig = Buffer.from(
    [3,73,82,79,78,0,56,10,28,208,182,142,211,198,151,111,15,20,146,86,250,170,109,36,208,141,243,129,243,
     170,77,31,118,164,202,16,162,26,24,10,22,73,78,84,69,71,82,65,84,73,79,78,45,84,69,83,84,45,67,79,77,
     66,79,26,52,171,230,127,70,255,176,159,101,188,45,190,225,125,190,32,161,245,113,170,72,115,232,204,
     142,228,144,123,83,16,30,107,196,240,131,72,45,101,226,100,39,126,216]);
//prettier-ignore
const existingEdekForEnabledConfig = "Cr4BCrgBAQICAHhhfiI+R/CnS0NJxVMGLAbLb/uEr64mDJAXLrWWWxAMQgEE/9yB7Dit96VAM3c5UDCzAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMquE2DnIIesdP/UknAgEQgDsHqfur2fJaAS8ZwnJNXr5cZWH1xL7xvIWgCzD9Aa1peULVadhDgUHXVUNTHodEr2JuUKXFGuX1aYMyehCaBA==";
//prettier-ignore
const existingEncryptedDataForDisabledConfig = Buffer.from(
    [3,73,82,79,78,0,56,10,28,173,13,21,195,209,147,53,178,230,76,22,145,234,235,177,90,138,107,134,69,145,
     126,42,75,190,66,246,198,26,24,10,22,73,78,84,69,71,82,65,84,73,79,78,45,84,69,83,84,45,67,79,77,66,79,
     190,77,198,69,195,57,110,188,68,250,205,161,118,93,188,182,71,184,93,82,58,122,76,104,33,204,215,161,
     221,213,56,246,123,122,148,5,71,71,222,192,50,219,4,27]);
//prettier-ignore
const existingEdekForDisabledConfig = "CqsCCqUCCoACNPQp9pKbmS+QmQhUfsBE9HKkXMA+cREXiuDrgD/B/hI8zn7rU5Sk4a6trDSr7DoUsG3y6dtBpcoeVIMzgztVr0xo2jzmC1BkyS1CcopUDV7WOq+giZ6NMUTXCQV1fd4sX+yFYQPJrsJ7zHlL72QScxDb66qOjkYu+jLSXj77JHBbFMYPBLRL2rMzZLJ1UIvhmZ1kFpxg5UFQOvitOIT/qSwAZXrqP7yJ1WoFMPg9PypPbMErHLv/ScoNFpMFFbM/X2c/HJXMwL7XSE4uJMRQeXooJ/waXe9nZ1NP/VFQnt9waMn0jYAdnQEbZOd6qp/Ib0HUDyAu2G0ymTGJmooBCRIgOWY5NWZkMjk0NjRhNDA0YzhjNzI1N2U3Njc5Y2MyZWYQoAQ=";

describe("INTEGRATION dev environment tests", () => {
    let client: TenantSecurityClient;

    beforeEach(() => {
        client = new TenantSecurityClient("http://127.0.0.1:7777", INTEGRATION_API_KEY);
    });

    describe("verify encrypted bytes", () => {
        it("fails to decrypt when provided encrypted bytes are not CMK bytes", async () => {
            const randomBytes = Buffer.from("randomBytes", "utf-8");
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await client.decryptDocument({edek: existingEdekForEnabledConfig, encryptedDocument: {bs: randomBytes}}, meta);
                fail("Should not be able to decrypt BS data");
            } catch (e) {
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT);
                expect(e).toBeInstanceOf(TscException);
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

        it("fails to double encrypt data", async () => {
            const data = TestUtils.getDocumentToEncrypt();
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);
            const encrypted = await client.encryptDocument(data, meta);

            try {
                await client.encryptDocument(encrypted.encryptedDocument, meta);
                fail("Should fail because documents are double encrypted");
            } catch (e) {
                expect(e).toBeInstanceOf(TenantSecurityException);
                expect(e.errorCode).toEqual(TenantSecurityErrorCode.DOCUMENT_ENCRYPT_FAILED);
                expect(e.message).toContain("`field1`, `field2`, `field3`");
            }
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

    describe("roundtrip re-key encrypt and decrypt", () => {
        it("roundtrips a collection of fields from AWS to self", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, AWS_TENANT_ID, AWS_TENANT_ID);
        });

        it("roundtrips a collection of fields from AWS to GCP", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, AWS_TENANT_ID, GCP_TENANT_ID);
        });

        it("roundtrips a collection of fields from GCP to self", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, GCP_TENANT_ID, GCP_TENANT_ID);
        });

        it("roundtrips a collection of fields from GCP to Azure", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, GCP_TENANT_ID, AZURE_TENANT_ID);
        });

        it("roundtrips a collection of fields from Azure to self", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, AZURE_TENANT_ID, AZURE_TENANT_ID);
        });

        it("roundtrips a collection of fields from Azure to AWS", async () => {
            await TestUtils.runSingleDocumentRekeyRoundTripForTenants(client, AZURE_TENANT_ID, AWS_TENANT_ID);
        });
    });

    describe("test tenant with multiple configs", () => {
        it("fails to encrypt new data with no primary config", async () => {
            const data = TestUtils.getDocumentToEncrypt();
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
            const data = TestUtils.getDocumentToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            try {
                await client.encryptDocumentBatch({fail: data}, meta);
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
            expect(decryptResult.plaintextDocument.doc.toString("utf-8")).toEqual("I'm Gumby dammit");
        });

        it("successfully re-encrypts with EDEK from active config", async () => {
            const data = TestUtils.getDocumentToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);

            const reEncryptResult = await client.encryptDocumentWithExistingKey({edek: existingEdekForEnabledConfig, plaintextDocument: data}, meta);

            expect(reEncryptResult.edek).toEqual(existingEdekForEnabledConfig);
            TestUtils.assertEncryptedData(client, reEncryptResult.encryptedDocument);
        });

        it("supports partial failure when reencrypting existing batch", async () => {
            const data = {
                good: {
                    edek: existingEdekForEnabledConfig,
                    plaintextDocument: TestUtils.getDocumentToEncrypt(),
                },
                bad: {
                    edek: existingEdekForDisabledConfig,
                    plaintextDocument: TestUtils.getDocumentToEncrypt(),
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
            const data = TestUtils.getDocumentToEncrypt();
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
            expect(batchDecryptResult.successes.good.plaintextDocument.bytes.toString("utf-8")).toEqual("I'm Gumby dammit");

            expect(batchDecryptResult.failures.bad).toBeInstanceOf(TenantSecurityException);
            expect(batchDecryptResult.failures.bad.errorCode).toEqual(TenantSecurityErrorCode.KMS_CONFIGURATION_DISABLED);
        });
    });

    describe("test Azure key version protobuf", () => {
        const azureEdekWithoutVersion =
            // Generated an EDEK and encrypted data using the current Azure vendor, then manipulated the
            // EDEK protobuf to remove the inner structure that had the EDEK and the key version, replacing
            // it with just the EDEK.
            "CoYCCoACROYAO1yPP926lVE7Ac/ifXLnDadg2j+sYQjGcjRSo8y1okyWY0VhSyH1nqicgHfpN50COZJchw+FZBlxZWWe+jpLHzfNVyvoBJr09YB5gDFesYyCg515SZZkRI5kY0Fy9Sgk3ytAo7X6dDJ3QUsqmHrSB1TW0Nmvu6cl57Dg4B3SWg7IjNirdZO7KgnhLuNfuDJ30RQn5HhwM/ilZxvW40pMlIbyYlRiFLET/6Ft4+VQ6UBvSTFSyQ/ueL9A2b+CUJfHevMwnseRfgmSfTJZdwWs9MUgpP08FIpQrEEZgCGOsRBWILqzYfEJ8lBFQHJ9KVWW/0IDgWsr41PRz9el1RCfBA==";
        const azureEncryptedDataForEdekWithoutVersion = Buffer.from(
            "A0lST04AOAocpdHKpxJjgEI3a0jHk4oxlkyZ/9PIi+pYMEfGkBoYChZJTlRFR1JBVElPTi1URVNULUFaVVJFOYdzhe/QKEJHAAiJvA87ov5Jyd/6qIeGEZl8/TpFA3BTEDiAVpyOAEYBHBk=",
            "base64"
        );
        const meta = TestUtils.getMetadata(AZURE_TENANT_ID);

        it("decrypts EDEK which doesnt have an Azure key version", async () => {
            const decrypt = await client.decryptDocument(
                {encryptedDocument: {foo: azureEncryptedDataForEdekWithoutVersion}, edek: azureEdekWithoutVersion},
                meta
            );

            expect(decrypt.edek).toEqual(azureEdekWithoutVersion);
            expect(decrypt.plaintextDocument.foo.toString("utf-8")).toEqual("I'm Gumby dammit");
        });

        it("fails with expected error when edek looks like protobuf, but isnt", async () => {
            //This is an Azure key that was generated before we added the additional wrapper of protobuf to store the Azure key version. However, this key
            //still successfully decodes as an empty protobuf object somehow which was causing failures. This test verifies that we get the proper error back,
            //namely that the key passed to Azure was invalid (because it's not a key we can decrypt, we got it from somewhere else) and not the error that
            //says that we didn't pass a key to Azure at all.
            //Manually modified the KMS config ID in the protobuf to match the staging environment.
            const hackedAzureEdek =
                "CoYCCoACMmiUBYFpypz6j0cLsIxK5JDHJAvw3uNy4ORmi+8pd5cDbfXGjDajR9U+stXoAKUQP6N3luQFJY3SXhX9w2+8d/vqlhj8zBXj1Zum16iznhl0w24sZIbZj9ar9yCvYmBNrErAVxL31MQYFSFGZjsxAVwLmM1wQI2wAyp7nHrV+f3mNLFF9depEvxhW98aI8SrpV+x4gAeVlfFh4CuhGroGVXfaCIHLQaR+Q3XyYB0OfL882XZSHuRggb77rccjdIZUgjkokKKhEaH0ac0Ylbktj/7x0msiK0nwgSLjnPfkxm4e5PCTc22VD/eFoYQ1jfzuSOOqzSMSKIPYA4l8dFHdxCfBA==";
            const meta = TestUtils.getMetadata(AZURE_TENANT_ID);

            try {
                await client.decryptDocument({encryptedDocument: {foo: azureEncryptedDataForEdekWithoutVersion}, edek: hackedAzureEdek}, meta);
            } catch (e) {
                expect(e.message).toContain("Code: BadParameter");
                expect(e.message).toContain("The parameter is incorrect");
                expect(e.message).not.toContain("Property 'value' is required");
            }
        });
    });

    describe("decrypted previously leased data", () => {
        //Verify that we can decrypt data that was encrypted when the configuration had leasing enabled. To generate this data I encrypted some data when
        //leasing was turned off (nonLeasedDocument) and another document when leasing was turned on (leasedDocument). Then leasing was disabled again. This
        //test verifies that the leased document can still be decrypted and that we have access to the leased data.
        const nonLeasedDocument = {
            edek: "CnYKcQokAMuLEZXMyIGIGj3qsI9uMPPIu3IjrQXRGdZuwWTj5OGOlp8LEkkAL8l2cUyJvtUTsWlWxzKByKGEdyDkn6d+3s86LQR0eEYxVNOosiLggyHmeuopfuMw21qfW2nTx5ughZJTUPMyA7VJggG9HjqVEJYE",
            data: "A0lST04ANgoc3NWCzR+7mXDkg2OMpRoqujSFzHlat0Vhax924xoWChRJTlRFR1JBVElPTi1URVNULUdDUHO5bi5yhCq2zd5lUX8Df0g0X8GooUjNTdPu4jsea6VDWMIdgenaxa7tGfoy",
        };

        const leasedDocument = {
            edek: "CsABCjCNEF2vxOsHAjFQservCufgFU7sdqrvy972uZvxB/FAyrH0nQrMIN3Cwvp4NdaSjBYQlgQY8QQiDMdgyc4wAvAH2y51JSp4CnYKcQokAMuLEZWEVofFnA3hHrgCzUXrGjDAb9wet28VKw4Nakn35ZnSEkkAL8l2cSCzG+n8LnpU0eW9wTFYgPnIckzDDcbnEgRj6dmz6IpCk2WzsX7dlvzRWi0UXvA87ukYAgYkrmmCUse2wWIYbzNruP6uEJYE",
            data: "A0lST04ANgocVzWAgU8k159ETeoE+b9F0wkZFjn6psKQhQ8dWhoWChRJTlRFR1JBVElPTi1URVNULUdDUNRZlwKbH7ZHtnQ2hdiGdNBJhqIC0p+hqMnzRO7AymqrCo8ohE8bIscVfTFk",
        };

        it("can still decrypted non-leased document", async () => {
            const data = {
                foo: Buffer.from(nonLeasedDocument.data, "base64"),
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);

            const {plaintextDocument} = await client.decryptDocument({edek: nonLeasedDocument.edek, encryptedDocument: data}, meta);

            expect(plaintextDocument.foo.toString("utf8")).toEqual("I'm Gumby dammit");
        });

        it("leased document", async () => {
            const data = {
                foo: Buffer.from(leasedDocument.data, "base64"),
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);

            const {plaintextDocument} = await client.decryptDocument({edek: leasedDocument.edek, encryptedDocument: data}, meta);

            expect(plaintextDocument.foo.toString("utf8")).toEqual("I'm Gumby dammit");
        });
    });

    describe("log security events", () => {
        it("sends an event to the TSP for a good tenant.", async () => {
            const metadata = new EventMetadata(GCP_TENANT_ID, "integrationTest", "sample", undefined, undefined, undefined, "app-request-id");

            // even though this tenant is bad, the response here will be success as the security
            // event was enqueued for further processing.
            let resp = await client.logSecurityEvent(UserEvent.ADD, metadata);
            expect(resp).toBeNull();
        });
    });
});

describe("INTEGRATION dev environment deterministic tests", () => {
    let client: DeterministicTenantSecurityClient;

    beforeEach(() => {
        client = new TenantSecurityClient("http://127.0.0.1:7777", INTEGRATION_API_KEY).deterministicClient;
    });

    describe("roundtrip encrypt and decrypt", () => {
        it("roundtrips a collection of fields in GCP", async () => {
            await TestUtils.runSingleDeterministicFieldRoundTripForTenant(client, GCP_TENANT_ID);
        });

        it("roundtrips a collection of fields in AWS", async () => {
            await TestUtils.runSingleDeterministicFieldRoundTripForTenant(client, AWS_TENANT_ID);
        });

        it("roundtrips a collection of fields in Azure", async () => {
            await TestUtils.runSingleDeterministicFieldRoundTripForTenant(client, AZURE_TENANT_ID);
        });
    });

    describe("roundtrip batch encrypt and batch decrypt", () => {
        it("should roundtrip batch documents in GCP", async () => {
            await TestUtils.runDeterministicBatchFieldRoundtripForTenant(client, GCP_TENANT_ID);
        });

        it("should roundtrip batch documents in AWS", async () => {
            await TestUtils.runDeterministicBatchFieldRoundtripForTenant(client, AWS_TENANT_ID);
        });

        it("should roundtrip batch documents in Azure", async () => {
            await TestUtils.runDeterministicBatchFieldRoundtripForTenant(client, AZURE_TENANT_ID);
        });
    });

    describe("encryptField", () => {
        it("fails to encrypt data for an unknown tenant", async () => {
            const data = TestUtils.getFieldToEncrypt();
            const meta = TestUtils.getMetadata("unknownTenant");
            await expect(client.encryptField(data, meta)).rejects.toThrow("No configurations available");
        });

        it("fails when encrypt with no primary config", async () => {
            const data = TestUtils.getFieldToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            await expect(client.encryptField(data, meta)).rejects.toThrow("no primary KMS config");
        });
    });

    describe("rotateField", () => {
        it("fails when rotate field with no primary config", async () => {
            const data = {
                encryptedField: Buffer.from([0, 0, 0, 1, 0, 0, 1]),
                secretPath: "path2",
                derivationPath: "path1",
            };
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            await expect(client.rotateField(data, meta)).rejects.toThrow("no primary KMS config");
        });
    });

    describe("generateSearchTerms", () => {
        it("search returns both Current and InRotation, but not Archived", async () => {
            const plaintextData = {
                plaintextField: Buffer.from([1, 2, 3]),
                secretPath: "foo",
                derivationPath: "bar",
            };
            // Tenant has 3 secrets for this data path - one of each rotationStatus
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);
            const searchTerms = await client.generateSearchTerms(plaintextData, meta);
            expect(searchTerms.length).toBe(2);
        });

        it("succeeds when generating search terms with no primary config", async () => {
            const data = TestUtils.getFieldToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const searchTerms = await client.generateSearchTerms(data, meta);
            expect(searchTerms.length).toBe(1);
        });

        it("matches encrypt when no rotation has occurred", async () => {
            const data = {
                plaintextField: Buffer.from("my-data", "utf8"),
                secretPath: "not-rotated",
                derivationPath: "path",
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);
            const searchTerms = await client.generateSearchTerms(data, meta);
            const encrypted = await client.encryptField(data, meta);
            expect(searchTerms.length).toBe(1);
            expect(searchTerms[0].encryptedField).toEqual(encrypted.encryptedField);
        });

        it("one value matches encrypt when rotation has occurred", async () => {
            const data = {
                plaintextField: Buffer.from("my-data", "utf8"),
                secretPath: "rotation-started",
                derivationPath: "path",
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);
            const searchTerms = await client.generateSearchTerms(data, meta);
            const encrypted = await client.encryptField(data, meta);
            expect(searchTerms.length).toBe(2);
            expect(searchTerms[0].encryptedField).toEqual(encrypted.encryptedField);
        });
    });

    describe("batch functions", () => {
        it("supports partial failure on batch decrypt", async () => {
            const plaintextData = {
                plaintextField: Buffer.from([1, 2, 3]),
                secretPath: "foo",
                derivationPath: "bar",
            };
            const meta = TestUtils.getMetadata(GCP_TENANT_ID);
            const batchEncryptResult = await client.encryptField(plaintextData, meta);
            const encryptedData = {
                good: batchEncryptResult,
                bad: {
                    // slice off the deterministic header, making these bytes invalid
                    encryptedField: batchEncryptResult.encryptedField.slice(6),
                    secretPath: batchEncryptResult.secretPath,
                    derivationPath: batchEncryptResult.derivationPath,
                },
            };
            const batchDecryptResult = await client.decryptFieldBatch(encryptedData, meta);
            expect(batchDecryptResult.hasFailures).toBeTrue();
            expect(batchDecryptResult.hasSuccesses).toBeTrue();
            expect(batchDecryptResult.successes.good.plaintextField).toEqual(plaintextData.plaintextField);
            expect(batchDecryptResult.failures.bad).toBeInstanceOf(TscException);
            expect(batchDecryptResult.failures.bad.errorCode).toEqual(TenantSecurityErrorCode.DETERMINISTIC_HEADER_ERROR);
        });

        it("fails when batch encrypt with no primary config", async () => {
            const data = TestUtils.getFieldToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            await expect(client.encryptFieldBatch({fail: data}, meta)).rejects.toThrow("no primary KMS config");
        });

        it("fails when batch rotate field with no primary config", async () => {
            const data = {
                encryptedField: Buffer.from([0, 0, 0, 1, 0, 0, 1]),
                secretPath: "path2",
                derivationPath: "path1",
            };
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            await expect(client.rotateFieldBatch({fail: data}, meta)).rejects.toThrow("no primary KMS config");
        });

        it("succeeds when batch generating search terms with no primary config", async () => {
            const data = TestUtils.getFieldToEncrypt();
            const meta = TestUtils.getMetadata(MULTIPLE_KMS_CONFIG_TENANT_ID);
            const searchTerms = await client.generateSearchTermsBatch({good: data}, meta);
            expect(Object.values(searchTerms.successes).length).toBe(1);
        });
    });
});
