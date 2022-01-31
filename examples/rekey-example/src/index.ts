import {DocumentMetadata, TenantSecurityClient} from "@ironcorelabs/tenant-security-nodejs/";

//
// Three parts:
// 1. Encrypt a customer record
// 2. Rekey the encrypted record to a new tenant
// 3. Decrypt the encrypted record using the new tenant
//

// In order to communicate with the TSP, you need a matching API_KEY. Find the right value from
// the end of the TSP configuration file, and set the API_KEY environment variable to that value.
const API_KEY = process.env.API_KEY;
if (API_KEY === undefined) {
    console.log("Must set the API_KEY environment variable.");
    process.exit(1);
}

// default encrypting to tenant "tenant-gcp". Override by setting the TENANT_ID environment variable
let TENANT_ID = process.env.TENANT_ID;
if (TENANT_ID === undefined) {
    TENANT_ID = "tenant-gcp";
}

// Initialize the client with a Tenant Security Proxy domain and API key.
// Typically this would be done once when the application or service initializes
const client = new TenantSecurityClient("http://localhost:32804", API_KEY);

//
// Part 1: Encrypting a customer record
//

// Create metadata used to associate this document to a tenant, name the document, and
// identify the service or user making the call
const metadata = new DocumentMetadata(TENANT_ID, "serviceOrUserId", "PII");

// Create a map containing your data
const custRecord = {
    ssn: Buffer.from("000-12-2345", "utf-8"),
    address: Buffer.from("2825-519 Stone Creek Rd, Bozeman, MT 59715", "utf-8"),
    name: Buffer.from("Jim Bridger", "utf-8"),
};

console.log(`Encrypting using tenant ${TENANT_ID}.`);

// Request a key from the KMS and use it to encrypt the document
client
    .encryptDocument(custRecord, metadata)
    .then((encryptedDocument) => {
        //
        // Part 2: Rekey the encrypted record to a new tenant
        //

        const NEW_TENANT_ID = "tenant-aws";

        console.log(`Rekeying to tenant ${NEW_TENANT_ID}.`);

        // Rekey the document to `tenant-aws` using their primary config. The metadata's name and
        // identifying information could also be changed at this time.
        return client.rekeyEdek(encryptedDocument.edek, NEW_TENANT_ID, metadata).then((rekeyedEdek) => {
            //
            // Part 3: Decrypt the encrypted record using the new tenant
            //

            const rekeyedDocument = {encryptedDocument: encryptedDocument.encryptedDocument, edek: rekeyedEdek};

            // Create new metadata for this document indicating that it was rekeyed to the second tenant.
            // The name and identifying information could also be changed at this time.
            const newMetadata = new DocumentMetadata(NEW_TENANT_ID, "serviceOrUserId", "PII");

            console.log(`Decrypting with tenant ${NEW_TENANT_ID}.`);

            // Decrypt the document encrypted to `tenant-aws`
            return client.decryptDocument(rekeyedDocument, newMetadata);
        });
    })
    .then((decryptedDoc) => {
        // Access decrypted fields from the doc
        const ssn = decryptedDoc.plaintextDocument.ssn.toString("utf-8");
        const address = decryptedDoc.plaintextDocument.address.toString("utf-8");
        const name = decryptedDoc.plaintextDocument.name.toString("utf-8");
        console.log(`Decrypted SSN: ${ssn}`);
        console.log(`Decrypted address: ${address}`);
        console.log(`Decrypted name: ${name}`);
    });
