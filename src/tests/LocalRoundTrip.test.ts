import "jest-extended";
import {TenantSecurityClient} from "../kms/TenantSecurityClient";
import * as TestUtils from "./TestUtils";

//Placeholders to be filled in by devs running tests
const LOCAL_TENANT_ID = "";
const LOCAL_API_KEY = "";

//These tests are meant to be used by developers to test things locally. If someone runs `yarn test` and hasn't set these up, we don't want
//these tests to fail because they didn't modify things. So if they haven't been set, skip these tests.
const conditionalTest = LOCAL_TENANT_ID && LOCAL_API_KEY ? it : it.skip;

describe("LOCAL Integration Tests", () => {
    let client: TenantSecurityClient;

    beforeEach(() => {
        client = new TenantSecurityClient("http://localhost:7777", LOCAL_API_KEY);
    });

    describe("roundtrip encrypt and decrypt", () => {
        conditionalTest("roundtrips a collection of fields", async () => {
            await TestUtils.runSingleDocumentRoundTripForTenant(client, LOCAL_TENANT_ID);
            await TestUtils.runSingleExistingDocumentRoundTripForTenant(client, LOCAL_TENANT_ID);
        });
    });

    describe("roundtrip batch encrypt and batch decrypt", () => {
        conditionalTest("should roundtrip batch documents", async () => {
            await TestUtils.runBatchDocumentRoundtripForTenant(client, LOCAL_TENANT_ID);
            await TestUtils.runReusedBatchDocumentRoundtripForTenant(client, LOCAL_TENANT_ID);
        });
    });
});
