import {DocumentMetadata, TenantSecurityClient} from "@ironcorelabs/tenant-security-nodejs";
import * as fs from "fs";

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

// Initialize the client with a Tenant Security Proxy domain and API key.
// Typically this would be done once when the application or service initializes
const client = new TenantSecurityClient("http://localhost:32804", API_KEY);

//
// Example 1: encrypting/decrypting a customer record
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

// Request a key from the KMS and use it to encrypt the document
client
    .encryptDocument(custRecord, metadata)
    .then((encryptResult) => {
        /* … persist the EDEK and encryptedDocument to your persistence layer … */
        const edek = encryptResult.edek;
        const encryptedDocument = encryptResult.encryptedDocument;

        /* … retrieve the encrypted fields and EDEK from your persistence layer */

        // Recreate the encrypted document from persisted data
        const recreated = {encryptedDocument, edek};
        // Decrypt the document back to plaintext
        return client.decryptDocument(recreated, metadata);
    })
    .then((decryptedDoc) => {
        // Access decrypted fields from the doc
        const name = decryptedDoc.plaintextDocument.name.toString("utf-8");
        console.log(name);
    });
//
// Example 2: encrypting/decrypting a file, using the filesystem for persistence
//

const filename = "success.jpg";

const sourceFile: Buffer = fs.readFileSync(filename);

// Request a key from the KMS and use it to encrypt the file
client
    .encryptDocument({file: sourceFile}, metadata)
    .then((encryptResult) => {
        // write the encrypted file and the encrypted key to the filesystem
        fs.writeFileSync(filename + ".enc", encryptResult.encryptedDocument.file);
        fs.writeFileSync(filename + ".edek", encryptResult.edek);
    })
    .then(() => {
        const encryptedFile = fs.readFileSync(filename + ".enc");
        const edek = fs.readFileSync(filename + ".edek", "utf-8");

        const fileAndEdek = {
            encryptedDocument: {file: encryptedFile},
            edek: edek,
        };

        return client.decryptDocument(fileAndEdek, metadata);
    })
    .then((decryptedFile) => {
        fs.writeFileSync("decrypted.jpg", decryptedFile.plaintextDocument.file);
    });
