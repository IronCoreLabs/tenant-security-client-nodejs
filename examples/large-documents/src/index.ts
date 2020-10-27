import {DocumentMetadata, TenantSecurityClient} from "@ironcorelabs/tenant-security-nodejs";
import * as fs from "fs";
import {performance, PerformanceObserver} from "perf_hooks";

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

// Create metadata used to associate this document to a tenant, name the document, and
// identify the service or user making the call
const metadata = new DocumentMetadata(TENANT_ID, "serviceOrUserId", "PII");

//
// Example 1: encrypting a large document, using the filesystem for persistence
// This whole file is an example of how you can avoid calls to the KMS/TSP when you have a tightly defined "document",
// even if that document is actually made up of many entities in a database. This shouldn't be done with disparate
// pieces of data that will commonly be decrypted/encrypted separately from each other. At that point using
// `[encrypt|decrypt]DocumentBatch()` is the better option, allowing you to make a single call to the TSP but still
// have different keys for each data piece.
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
const docToEncrypt = sourceObj.subDocs.reduce((acc: Record<string, Buffer>, sub_doc: SubDoc) => {
    acc[sub_doc.subDocId] = Buffer.from(JSON.stringify(sub_doc));
    return acc;
}, {});

// Request a key from the KMS and use it to encrypt all the sub documents
performance.mark("encryptAllSubdocsS");
const writeP = client.encryptDocument(docToEncrypt, metadata).then((encryptResult) => {
    performance.mark("encryptAllSubdocsE");
    // write the encrypted subdocs and the encrypted key to the filesystem
    fs.rmdirSync(subfolder, {recursive: true});
    fs.mkdirSync(subfolder);
    Object.entries(encryptResult.encryptedDocument).forEach(([subDocId, encDocBuffer]) => fs.writeFileSync(`${subfolder}/${subDocId}.enc`, encDocBuffer));
    fs.writeFileSync(`${subfolder}/${filename}.edek`, encryptResult.edek);
});

//
// Example 2: update two subdocuments in our persistence layer
//
const subDocId1 = "4c3173c3-8e09-49eb-a4ee-428e2dbf5296";
const subDocId2 = "4e57e8bd-d88a-4083-9fac-05a635110e2a";
const subDecryptP = writeP
    .then(() => {
        // Read the two files out first
        const encryptedFile1: Buffer = fs.readFileSync(`${subfolder}/${subDocId1}.enc`);
        const encryptedFile2: Buffer = fs.readFileSync(`${subfolder}/${subDocId2}.enc`);

        // In a DB situation this edek could be stored with the large doc (if sub docs are only decrypted in that context)
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

        // Decrypt the two subdocuments
        performance.mark("decryptTwoSubdocsS");
        return client.decryptDocument(encryptedPartialBigDoc, metadata);
    })
    .then((decryptedPartialBigDoc) => {
        performance.mark("decryptTwoSubdocsE");
        // Turn the decrypted bytes back into json objects
        const rehydrated: Record<string, SubDoc> = objectMap(decryptedPartialBigDoc.plaintextDocument, (buffer: Buffer) => JSON.parse(buffer.toString()));

        // Write out the rehydrated docs as proof that things round tripped fine
        fs.writeFileSync(`${subfolder}/partial-large-document.json`, Buffer.from(JSON.stringify(rehydrated)));

        // update the text in the subdocuments
        rehydrated[subDocId1].text = "UPDATED" + rehydrated[subDocId1].text;
        rehydrated[subDocId2].text = "UPDATED" + rehydrated[subDocId2].text;

        // Back to buffers again!
        const dehydrated: Record<string, Buffer> = objectMap(rehydrated, (subDoc: SubDoc) => Buffer.from(JSON.stringify(subDoc)));

        // Encrypt just the two subdocuments, using the same key that all the others are encrypted with
        performance.mark("encryptTwoSubdocsS");
        const edek: string = fs.readFileSync(`${subfolder}/${filename}.edek`, "utf-8");
        return client.encryptDocumentWithExistingKey({edek, plaintextDocument: dehydrated}, metadata);
    });

//
// Example 3: decrypt all the subdocuments in the filesystem and reconstitute the original BigDoc subDocs field
//
const finishAllP = subDecryptP
    .then((encryptedUpdates) => {
        performance.mark("encryptTwoSubdocsE");
        // Replace the updated subdocs in the persistent layer
        fs.writeFileSync(`${subfolder}/${subDocId1}.enc`, encryptedUpdates.encryptedDocument[subDocId1]);
        fs.writeFileSync(`${subfolder}/${subDocId2}.enc`, encryptedUpdates.encryptedDocument[subDocId2]);

        // Read all the subdocuments back into an array
        const filenames = fs.readdirSync(subfolder).filter((name) => name.includes(".enc"));
        const subDocBuffers = filenames.map((subDocEncFile) => fs.readFileSync(`${subfolder}/${subDocEncFile}`));

        // The original object's field was just an array, so we don't care about what keys we use here when constructing our document to decrypt
        const encryptedDocument = subDocBuffers.reduce((acc: {[key: number]: Buffer}, buffer: Buffer, i: number) => {
            acc[i] = buffer;
            return acc;
        }, {});
        const edek: string = fs.readFileSync(`${subfolder}/${filename}.edek`, "utf-8");
        const encryptedBigDoc = {encryptedDocument, edek};

        // Decrypt all the subdocuments at once. Since all of our subdocuments used the same key, we only make one call to the KMS to unwrap that key,
        // then reuse it for all the AES operations involved in the decrypt
        performance.mark("decryptAllSubdocsS");
        return client.decryptDocument(encryptedBigDoc, metadata);
    })
    .then((decryptedBigDoc) => {
        performance.mark("decryptAllSubdocsE");
        const rehydrated = Object.values(decryptedBigDoc.plaintextDocument).map((buffer: Buffer) => JSON.parse(buffer.toString()));
        fs.writeFileSync(`${subfolder}/subdocuments-large-document.json`, Buffer.from(JSON.stringify({subDocs: rehydrated})));
    });

// Write timing information to console and (optionally) add to csv
finishAllP
    .then(() => {
        const obs = new PerformanceObserver((list) => {
            const encAll = list.getEntriesByName("encryptAllSubdocs")[0].duration;
            const decAll = list.getEntriesByName("decryptAllSubdocs")[0].duration;
            const encTwo = list.getEntriesByName("encryptTwoSubdocs")[0].duration;
            const decTwo = list.getEntriesByName("decryptTwoSubdocs")[0].duration;
            console.log(`Time to encrypt all 5000 subdocs: ${encAll}ms`);
            console.log(`Time to decrypt all 5000 subdocs: ${decAll}ms`);
            console.log(`Time to encrypt two subdocs: ${encTwo}ms`);
            console.log(`Time to decrypt two subdocs: ${decTwo}ms`);

            // CSV headers will need to be added yourself, and should be something like
            // `encrypt_all, decrypt_all, encrypt_two, decrypt_two`
            // uncomment to append timing to a csv file in the project root
            fs.appendFileSync("large-document-performance.csv", `${[encAll, decAll, encTwo, decTwo].join(",")}\n`);
        });
        obs.observe({entryTypes: ["measure"], buffered: true});
        performance.measure("encryptAllSubdocs", "encryptAllSubdocsS", "encryptAllSubdocsE");
        performance.measure("decryptAllSubdocs", "decryptAllSubdocsS", "decryptAllSubdocsE");
        performance.measure("decryptTwoSubdocs", "decryptTwoSubdocsS", "decryptTwoSubdocsE");
        performance.measure("encryptTwoSubdocs", "encryptTwoSubdocsS", "encryptTwoSubdocsE");
    })
    .catch((reason) => console.log(reason));

// Helper to map over an object, types are whack here, don't use in prod
const objectMap = <T1, T2>(obj: Record<string, T1>, f: (v: T1) => T2): Record<string, T2> =>
    Object.keys(obj).reduce((result, key) => {
        result[key] = f(obj[key]);
        return result;
    }, {} as Record<string, T2>);
