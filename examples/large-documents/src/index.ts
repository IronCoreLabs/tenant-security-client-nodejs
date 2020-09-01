import {RequestMetadata, TenantSecurityKmsClient} from "@ironcorelabs/tenant-security-nodejs";
import * as fs from "fs";

// In order to communicate with the TSP, you need a matching API_KEY. Find the right value from
// end of the TSP configuration file, and set the API_KEY environment variable to that value.
const API_KEY = process.env.API_KEY;

if (API_KEY === undefined) {
    console.log("Must set the API_KEY environment variable.");
    process.exit(1);
}

var TENANT_ID = process.env.TENANT_ID;

if (TENANT_ID === undefined) {
    TENANT_ID = "testTenant"; // TODO: set back to tenant1
}
console.log(`Using tenant ${TENANT_ID}.`);

// Initialize the client with a Tenant Security Proxy domain and API key.
// Typically this would be done once when the application or service initializes
const client = new TenantSecurityKmsClient("http://localhost:7777", API_KEY); // TODO: back to 32804

// Create metadata used to associate this document to a tenant, name the document, and
// identify the service or user making the call
const metadata = new RequestMetadata(TENANT_ID, "serviceOrUserId", "PII");

//
// Example 1: encrypting a large document, using the filesystem for persistence
//
interface SubDoc {
    subDocId: string;
    text: string;
}

interface BigDoc {
    mainDocId: string;
    title: string;
    description: string;
    subDocs: SubDoc[];
}

const filename = "large-document.json";
const subfolder = "sub-docs";

const sourceFile: Buffer = fs.readFileSync(filename);
const sourceObj: BigDoc = JSON.parse(sourceFile.toString());

// Reduce the document to a map of all the sub documents to be encrypted with the same key
let docToEncrypt = sourceObj.subDocs.reduce((acc: Record<string, Buffer>, sub_doc: SubDoc) => {
    acc[sub_doc.subDocId] = Buffer.from(JSON.stringify(sub_doc));
    return acc;
}, {});

// Request a key from the KMS and use it to encrypt all the sub documents
let writeP = client.encryptDocument(docToEncrypt, metadata).then((encryptResult) => {
    // write the encrypted subdocs and the encrypted key to the filesystem
    fs.rmdirSync(subfolder, {recursive: true});
    fs.mkdirSync(subfolder);
    Object.entries(encryptResult.encryptedDocument).forEach(([subDocId, encDocBuffer]) => fs.writeFileSync(`${subfolder}/${subDocId}.enc`, encDocBuffer));
    fs.writeFileSync(`${subfolder}/${filename}.edek`, encryptResult.edek);
});

//
// Example 2: decrypt two of the sub documents using the same edek
//
let subDecryptP = writeP
    .then(() => {
        const subDocId1: string = "4c3173c3-8e09-49eb-a4ee-428e2dbf5296";
        const subDocId2: string = "4e57e8bd-d88a-4083-9fac-05a635110e2a";
        const encryptedFile1: Buffer = fs.readFileSync(`${subfolder}/${subDocId1}.enc`);
        const encryptedFile2: Buffer = fs.readFileSync(`${subfolder}/${subDocId2}.enc`);
        // In a DB situation this edek could be store with the large doc (if sub docs are only decrypted in that context)
        // or it could be stored alongside each sub-document. In the latter case you make it harder to accidentally
        // cryptoshred data by de-syncing edeks at the cost of row size
        const edek: string = fs.readFileSync(`${subfolder}/${filename}.edek`, "utf-8");

        // each of the documents could be individually decrypted with their own calls, but by combining them
        // into one structure we ensure we only make one call to the KMS to unwrap the key
        const encryptedPartialBigDoc = {
            encryptedDocument: {
                [subDocId1]: encryptedFile1,
                [subDocId2]: encryptedFile2,
            },
            edek,
        };

        return client.decryptDocument(encryptedPartialBigDoc, metadata);
    })
    .then((decryptedPartialBigDoc) => {
        const rehydrated = objectMap(decryptedPartialBigDoc.plaintextDocument, (buffer: Buffer) => JSON.parse(buffer.toString()));
        fs.writeFileSync(`${subfolder}/partial-large-document.json`, Buffer.from(JSON.stringify(rehydrated)));
    });

//
// Example 3: decrypt all the documents and reconstitute the original BigDoc subDocs field
//
subDecryptP
    .then(() => {
        const filenames = fs.readdirSync(subfolder).filter((name) => name.includes(".enc"));
        const subDocBuffers = filenames.map((subDocEncFile) => fs.readFileSync(`${subfolder}/${subDocEncFile}`));

        // the original object's field was just an array, so we don't care about what keys we use here
        const encryptedDocument = subDocBuffers.reduce((acc: {[key: number]: Buffer}, buffer: Buffer, i: number) => {
            acc[i] = buffer;
            return acc;
        }, {});
        const edek: string = fs.readFileSync(`${subfolder}/${filename}.edek`, "utf-8");
        const encryptedBigDoc = {encryptedDocument, edek};

        return client.decryptDocument(encryptedBigDoc, metadata);
    })
    .then((decryptedBigDoc) => {
        const rehydrated = Object.values(decryptedBigDoc.plaintextDocument).map((buffer: Buffer) => JSON.parse(buffer.toString()));
        fs.writeFileSync(`${subfolder}/subdocuments-large-document.json`, Buffer.from(JSON.stringify({subDocs: rehydrated})));
    });

// Helper to map over an object
const objectMap: (obj: any, f: Function) => object = (obj, f) =>
    Object.keys(obj).reduce<any>((result, key) => {
        result[key] = f(obj[key]);
        return result;
    }, {});
