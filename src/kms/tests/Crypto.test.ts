import * as Crypto from "../Crypto";

describe("UNIT deterministicEncryptDocument", () => {
    const doc = {document: {field: Buffer.from("aaaaaa")}, derivationPath: "path1", secretPath: "path2"};

    const derivedKey = [
        {
            derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=",
            tenantSecretId: "aaa",
            tenantSecretNumericId: 5,
            primary: true,
        },
    ];

    test("roundtrips when given valid key", async () => {
        const encrypted = await Crypto.deterministicEncryptDocument(doc, derivedKey);
        const decrypted = await Crypto.deterministicDecryptDocument(encrypted, derivedKey);
        expect(decrypted.document.field).toEqual(doc.document.field);
    });

    test("is stable for a given key/plaintext", async () => {
        const encrypted1 = await Crypto.deterministicEncryptDocument(doc, derivedKey);
        const encrypted2 = await Crypto.deterministicEncryptDocument(doc, derivedKey);
        expect(encrypted1.encryptedDocument.field).toEqual(encrypted2.encryptedDocument.field);
    });

    test("errors when no primary key found", async () => {
        const key = [
            {
                derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=",
                tenantSecretId: "aaa",
                tenantSecretNumericId: 5,
                primary: false,
            },
        ];
        await expect(Crypto.deterministicEncryptDocument(doc, key)).rejects.toThrow("Failed deterministic encryption");
    });
});

describe("UNIT generateDeterministicEncryptedDocumentHeader", () => {
    test("generates a stable header for a given secret ID", async () => {
        const tenantSecretId = 420;
        const header = await Crypto.generateDeterministicEncryptedDocumentHeader(tenantSecretId);
        const header2 = await Crypto.generateDeterministicEncryptedDocumentHeader(tenantSecretId);
        expect(header).toEqual(header2);
    });

    test("works for all input bounds", async () => {
        const header = await Crypto.generateDeterministicEncryptedDocumentHeader(0);
        const expected = Buffer.from([0, 0, 0, 0, 0, 0]);
        expect(header).toEqual(expected);

        const header2 = await Crypto.generateDeterministicEncryptedDocumentHeader(4294967295);
        const expected2 = Buffer.from([255, 255, 255, 255, 0, 0]);
        expect(header2).toEqual(expected2);
    });

    test("roundtrips with decomposeDeterministicField", async () => {
        const tenantSecretId = 420;
        const header = await Crypto.generateDeterministicEncryptedDocumentHeader(tenantSecretId);
        const decomposed = await Crypto.decomposeDeterministicField(header);
        expect(decomposed.tenantSecretId).toBe(tenantSecretId);
    });

    test("fails for out of bounds", async () => {
        const header = Crypto.generateDeterministicEncryptedDocumentHeader(4294967296);
        await expect(header).rejects.toThrow("generate header");
    });
});
