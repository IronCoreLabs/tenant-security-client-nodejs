import {EncryptedDeks} from "./transform";
import {KeyManagementServiceClient} from "@google-cloud/kms";
import * as crypto from "crypto";

/**
 * These values were taken from the `simple-roundtrip` example 1, when run with `tenant-gcp` from the demo deployment.
 * In a real situation these would be the values that you have stored in your database or other persistence layer.
 */
const unleasedEdek =
    "CnYKcQokAAWBd/PUwMPr6AwCCyvieKQneyKAIFtFkCSn/m0Yj9rFVeeiEkkA8xjtHi5I1mPeKaJP4pDZGwUEZl/EF+zA/dQsG5FT/dWFZd0AWOCsJ8fR2BluVvs6hmSKHEI+b1UFGgiCbcgSJKrXRKBQDZWXEP4D";
const unleasedEncryptedDocumentMap = {
    ssn: Buffer.from([
        3, 73, 82, 79, 78, 0, 44, 10, 28, 229, 238, 200, 244, 222, 242, 34, 95, 232, 240, 140, 107, 44, 225, 8, 106, 64, 195, 248, 240, 83, 31, 130, 98, 51,
        103, 251, 77, 26, 12, 10, 10, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 26, 32, 2, 32, 90, 218, 169, 232, 1, 171, 220, 113, 42, 139, 10, 14, 113,
        168, 47, 4, 18, 50, 40, 181, 216, 216, 139, 64, 205, 180, 146, 70, 7, 75, 5, 158, 127, 204, 193,
    ]),

    address: Buffer.from([
        3, 73, 82, 79, 78, 0, 44, 10, 28, 240, 191, 238, 174, 177, 216, 75, 143, 149, 171, 250, 89, 203, 209, 174, 39, 187, 202, 201, 231, 3, 33, 60, 26, 30,
        179, 3, 40, 26, 12, 10, 10, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 151, 105, 128, 156, 242, 222, 196, 129, 127, 6, 64, 161, 53, 204, 69, 146,
        204, 207, 157, 220, 195, 255, 89, 52, 47, 80, 225, 149, 203, 243, 169, 170, 46, 86, 223, 23, 188, 124, 12, 170, 77, 189, 191, 169, 160, 9, 55, 241, 120,
        198, 181, 242, 31, 220, 38, 138, 202, 212, 179, 125, 147, 220, 12, 4, 149, 135, 117, 171, 196, 124,
    ]),

    name: Buffer.from([
        3, 73, 82, 79, 78, 0, 44, 10, 28, 149, 234, 176, 19, 216, 177, 52, 148, 131, 165, 249, 184, 228, 31, 208, 235, 146, 64, 19, 95, 37, 197, 245, 31, 58,
        205, 195, 38, 26, 12, 10, 10, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 101, 135, 210, 170, 162, 96, 37, 72, 194, 147, 38, 42, 166, 188, 28, 96,
        171, 21, 189, 66, 103, 247, 186, 24, 164, 165, 86, 62, 230, 228, 26, 240, 62, 2, 11, 21, 10, 211, 102,
    ]),
};

/**
 * These values were taken from the `simple-roundtrip` example 1, when run with `tenant-gcp-l` from the demo deployment.
 * In a real situation these would be the values that you have stored in your database or other persistence layer.
 */
const leasedEdek =
    "CsABCjBtYZ8SWWxWZWoeS7vz9bpz2T1jQJZVqOb2R/tQQV3KQUiERy9Qks4InVcbnCeWGLEQ/wMY4QQiDBXut/9Hpdor+7JwHCp4CnYKcQokAKUEZIeA4fMq5YOSdWX0kFcGvxZIeU3shB0QYKIHXrCzX1alEkkA3PhOjHTakyx7ScSCcJ16JvaQI7pMwqudlT3M5BeedUR0lYBXEtPAYpfo4pcSGgnXdMsnB0+ziDGoZSO/sykLLDIvCMl8hvOuEP8D";
const leasedEncryptedDocumentMap = {
    ssn: Buffer.from([
        3, 73, 82, 79, 78, 0, 46, 10, 28, 65, 94, 120, 210, 14, 117, 186, 249, 51, 77, 85, 203, 217, 224, 79, 243, 154, 98, 65, 219, 93, 203, 186, 22, 218, 47,
        125, 229, 26, 14, 10, 12, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 45, 108, 31, 176, 208, 200, 186, 234, 217, 9, 192, 186, 77, 175, 32, 116, 143,
        37, 84, 182, 101, 105, 187, 160, 159, 17, 210, 178, 126, 29, 72, 19, 164, 55, 112, 130, 39, 232, 186, 248, 87,
    ]),
    address: Buffer.from([
        3, 73, 82, 79, 78, 0, 46, 10, 28, 194, 129, 141, 252, 45, 186, 58, 68, 130, 40, 18, 169, 90, 17, 13, 237, 147, 189, 127, 236, 59, 205, 21, 32, 104, 138,
        126, 29, 26, 14, 10, 12, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 45, 108, 125, 38, 93, 2, 5, 208, 168, 19, 117, 83, 253, 221, 157, 51, 36, 247,
        32, 73, 92, 210, 203, 242, 95, 209, 26, 188, 136, 84, 98, 149, 2, 173, 127, 222, 128, 80, 153, 16, 151, 46, 245, 28, 207, 184, 146, 54, 94, 38, 233, 78,
        211, 130, 151, 9, 47, 221, 171, 228, 149, 135, 33, 46, 181, 52, 16, 81, 47, 9, 192, 2,
    ]),

    name: Buffer.from([
        3, 73, 82, 79, 78, 0, 46, 10, 28, 95, 148, 124, 100, 70, 163, 1, 139, 254, 213, 34, 180, 14, 102, 50, 40, 242, 91, 71, 130, 21, 189, 71, 188, 140, 10,
        24, 214, 26, 14, 10, 12, 116, 101, 110, 97, 110, 116, 45, 103, 99, 112, 45, 108, 213, 105, 162, 28, 56, 218, 68, 108, 206, 90, 9, 65, 8, 31, 134, 140,
        255, 91, 81, 169, 41, 188, 131, 247, 237, 134, 97, 165, 10, 215, 144, 119, 185, 109, 91, 186, 102, 194, 171,
    ]),
};

/**
 * An IronCore document has a specific shape:
 *      VERSION_NUMBER (1 byte, fixed at 3)
 *      IRONCORE_MAGIC (4 bytes, IRON in ASCII)
 *      HEADER_LENGTH (2 bytes Uint16)
 *      PROTOBUF_HEADER_DATA (variable bytes based on prior field)
 *      DATA IV (12 bytes)
 *      ENCRYPTED_DATA (remaining_length - 16 bytes)
 *      GCM_TAG (16 bytes)
 * We only need to extract the IV, data, and GCM tag to decrypt the document.
 */
const VERSION_LENGTH = 1;
const IRONCORE_MAGIC_LENGTH = 4;
const IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;
const HEADER_LENGTH_LENGTH = 2;

/**
 * Since we only need parts further in, we first skip past the version, magic, and header contents. To be more robust
 * you could use the magic to make sure you have an IronCore document, and use the header version and contents. See
 * https://github.com/IronCoreLabs/tenant-security-client-nodejs/blob/main/src/kms/Crypto.ts as a starting point for more
 * complex logic related to this, as well as current versions to check for and what they may contain.
 */
const removeHeader = (documentBuffer: Buffer): Buffer => {
    const protobufHeaderLength = documentBuffer.readUInt16BE(VERSION_LENGTH + IRONCORE_MAGIC_LENGTH);
    return documentBuffer.slice(VERSION_LENGTH + IRONCORE_MAGIC_LENGTH + HEADER_LENGTH_LENGTH + protobufHeaderLength);
};

/**
 * We can split apart the encrypted document bytes into the pieces we actually need to decrypt the encrypted bytes.
 */
const decomposeEncryptedDocument = (documentBuffer: Buffer): {iv: Buffer; encryptedBytes: Buffer; gcmTag: Buffer} => ({
    iv: documentBuffer.slice(0, IV_LENGTH),
    encryptedBytes: documentBuffer.slice(IV_LENGTH, documentBuffer.length - GCM_TAG_LENGTH),
    gcmTag: documentBuffer.slice(documentBuffer.length - GCM_TAG_LENGTH),
});

/**
 * The other piece of the puzzle is the DEK (document encryption key). This can only be accessed using the KMS client
 * that was used to created it. That means in the case of a vendor created config you need to know which credentials
 * and keypath were used in it's creation. In the case of a tenant created config the tenant will need to give you
 * credentials to access their KMS, and the keypath used to create the DEK. Alternatively you could give them the
 * encrypted bytes and a utility program based on this example that would accept those arguments and be run by them.
 * If you don't know which specific credentials/keypath combo was used but have access to all of them, you could
 * exhaustively do this process to decrypt the document.
 *
 * If the DEK was unleased you call out to the KMS directly to decrypt the EDEK (encrypted DEK).
 * If the DEK was leased you have to call out to the KMS to decrypt the leased key, then used the leased key to
 * decrypt the EDEK.
 *
 * For the purposes of this example we have two tenants that were using GCP and we have access to the creds and keypath
 *  * one unleased, `tenant-gcp`
 *  * one leased, `tenant-gcp-l`
 */
const retrieveDek = async (edekBase64: string): Promise<Uint8Array> => {
    const encryptedDeks = EncryptedDeks.decode(Uint8Array.from(Buffer.from(edekBase64, "base64"))).encryptedDeks;
    const encryptedDek = encryptedDeks[0];
    const client = new KeyManagementServiceClient();

    if (encryptedDek.leasedKeyId === 0) {
        // this document was encrypted with an unleased key so we can just call KMS decrypt to get the DEK
        const keyName = client.cryptoKeyPath("discrete-log-2", "global", "icl-demo", "tenant-gcp-key");
        const [response] = await client.decrypt({name: keyName, ciphertext: encryptedDek.encryptedDekData});
        if (response && response.plaintext && typeof response.plaintext !== "string") {
            const dek = response.plaintext;
            return dek;
        }
    } else {
        // this document was encrypted with a leased key so we need to KMS decrypt that before we can use it
        const keyName = client.cryptoKeyPath("discrete-log-2", "global", "icl-demo", "tenant-gcp-l-key");
        // the encrypted leased key data itself is also an EDEK, so we need to parse it before sending its internal data to the KMS
        const elkDekData = encryptedDek.encryptedLeasedKeyData!.encryptedDeks[0].encryptedDekData;
        const [response] = await client.decrypt({name: keyName, ciphertext: elkDekData});
        if (response && response.plaintext && typeof response.plaintext !== "string") {
            // this is the full leased key that we had originally sent to the kms to be encrypted
            const leasedKey = Buffer.from(response.plaintext);

            // this is the EDEK that was generated by the TSP and encrypted using the leased key
            const documentEdek = encryptedDek.encryptedDekData.slice(0, encryptedDek.encryptedDekData.length - GCM_TAG_LENGTH);
            const documentGcmTag = encryptedDek.encryptedDekData.slice(encryptedDek.encryptedDekData.length - GCM_TAG_LENGTH);

            // now we have all the pieces to get back the original DEK used to encrypt the document
            const iv = encryptedDek.leasedKeyIv;
            const cipher = crypto.createDecipheriv("aes-256-gcm", leasedKey, iv);
            cipher.setAuthTag(documentGcmTag);

            const dek = Buffer.concat([cipher.update(documentEdek), cipher.final()]);
            return dek;
        }
    }

    throw new Error("Something went wrong, and we're not returning void.");
};

/**
 * Now that we can get all the pieces it's a simple AES decryption to get the original data.
 */
const decryptDocument = async (documentMap: {[fieldName: string]: Buffer}, edek: string) => {
    const decryptedDocumentEntries = await Promise.all(
        Object.entries(documentMap).map(async ([fieldName, encryptedField]) => {
            const {iv, encryptedBytes, gcmTag} = decomposeEncryptedDocument(removeHeader(encryptedField));
            const dek = await retrieveDek(edek);
            const cipher = crypto.createDecipheriv("aes-256-gcm", dek, iv);
            cipher.setAuthTag(gcmTag);

            const decryptedField = Buffer.concat([cipher.update(encryptedBytes), cipher.final()]);
            return [fieldName, decryptedField] as [string, Buffer];
        })
    );

    return Object.fromEntries(decryptedDocumentEntries);
};

(async () => {
    console.log(
        `Unleased Encrypted Document: ${JSON.stringify(
            Object.fromEntries(
                Object.entries(unleasedEncryptedDocumentMap).map(([fieldName, encryptedFieldBytes]) => [fieldName, encryptedFieldBytes.toString("utf8")])
            ),
            null,
            2
        )}`
    );
    const decryptedUnleasedDocumentBytes = await decryptDocument(unleasedEncryptedDocumentMap, unleasedEdek);
    const decryptedUnleasedDocumentText = Object.fromEntries(
        Object.entries(decryptedUnleasedDocumentBytes).map(([fieldName, decryptedFieldBytes]) => [fieldName, decryptedFieldBytes.toString("utf8")])
    );
    console.log(`Unleased Document: ${JSON.stringify(decryptedUnleasedDocumentText, null, 2)}`);

    console.log(
        `Leased Encrypted Document: ${JSON.stringify(
            Object.fromEntries(
                Object.entries(leasedEncryptedDocumentMap).map(([fieldName, encryptedFieldBytes]) => [fieldName, encryptedFieldBytes.toString("utf8")])
            ),
            null,
            2
        )}`
    );
    const decryptedLeasedDocumentBytes = await decryptDocument(leasedEncryptedDocumentMap, leasedEdek);
    const decryptedLeasedDocumentText = Object.fromEntries(
        Object.entries(decryptedLeasedDocumentBytes).map(([fieldName, decryptedFieldBytes]) => [fieldName, decryptedFieldBytes.toString("utf8")])
    );
    console.log(`Leased Document: ${JSON.stringify(decryptedLeasedDocumentText, null, 2)}`);
})().catch((e) => {
    console.log(e);
});
