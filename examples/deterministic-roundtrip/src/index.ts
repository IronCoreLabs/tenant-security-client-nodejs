import {FieldMetadata} from "@ironcorelabs/tenant-security-nodejs";
import {DeterministicTenantSecurityClient} from "@ironcorelabs/tenant-security-nodejs/src/kms/DeterministicTenantSecurityClient";

// In order to communicate with the TSP, you need a matching API_KEY. Find the right value from
// end of the TSP configuration file, and set the API_KEY environment variable to that value.
const API_KEY = process.env.API_KEY;

if (API_KEY === undefined) {
    console.log("Must set the API_KEY environment variable.");
    process.exit(1);
}

let TENANT_ID = process.env.TENANT_ID;

if (TENANT_ID === undefined) {
    TENANT_ID = "tenant-gcp";
}
console.log(`Using tenant ${TENANT_ID}.`);

// Initialize the deterministic client with a Tenant Security Proxy domain and API key.
// Typically this would be done once when the application or service initializes
const client = new DeterministicTenantSecurityClient("http://localhost:32804", API_KEY);

// Create metadata used to associate this field to a tenant, name the field, and
// identify the service or user making the call
const metadata = new FieldMetadata(TENANT_ID, "serviceOrUserId", "PII");

// Create a plaintext field containing your data
const fieldBytes = Buffer.from("Jim Bridger", "utf-8");
const field = {
    plaintextField: fieldBytes,
    derivationPath: "derivPath",
    secretPath: "secretPath",
};

// Request secret derived by the KMS and use it to encrypt the field
client
    .encryptField(field, metadata)
    .then((encryptResult) => {
        /* … persist the encryptedField to your persistence layer … */
        const encryptedField = encryptResult.encryptedField;
        /* … retrieve the encrypted field from your persistence layer */

        // Recreate the encrypted field from persisted data
        const recreated = {encryptedField, derivationPath: "derivPath", secretPath: "secretPath"};
        // Decrypt the field back to plaintext
        return client.decryptField(recreated, metadata);
    })
    .then((decryptedField) => {
        const name = decryptedField.plaintextField.toString("utf-8");
        console.log(name);
    });
