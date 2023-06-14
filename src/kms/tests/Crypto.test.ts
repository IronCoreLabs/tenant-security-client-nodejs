import * as Crypto from "../Crypto";

const plaintextField = {plaintextField: Buffer.from("aaaaaa"), derivationPath: "path1", secretPath: "path2"};

const derivedKeys = [
    {
        derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=",
        tenantSecretId: "aaa",
        tenantSecretNumericId: 5,
        primary: true,
    },
    {
        derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=", // TODO: different valid key
        tenantSecretId: "bbb",
        tenantSecretNumericId: 6,
        primary: false,
    },
];

describe("UNIT deterministicEncryptField", () => {
    test("roundtrips when given valid key", async () => {
        const encrypted = await Crypto.deterministicEncryptField(plaintextField, derivedKeys);
        const decrypted = await Crypto.deterministicDecryptField(encrypted, derivedKeys);
        expect(decrypted.plaintextField).toEqual(plaintextField.plaintextField);
    });

    test("is stable for a given key/plaintext", async () => {
        const encrypted1 = await Crypto.deterministicEncryptField(plaintextField, derivedKeys);
        const encrypted2 = await Crypto.deterministicEncryptField(plaintextField, derivedKeys);
        expect(encrypted1.encryptedField).toEqual(encrypted2.encryptedField);
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
        await expect(Crypto.deterministicEncryptField(plaintextField, key)).rejects.toThrow("Failed deterministic encryption");
    });
});

describe("UNIT deterministicSearch", () => {
    test("returns 2 entries for 2 keys", async () => {
        const encrypted = await Crypto.deterministicSearch(plaintextField, derivedKeys);
        expect(encrypted.length).toBe(2);
        const result1FirstBytes = encrypted[0].encryptedField.slice(0, 4);
        const result2FirstBytes = encrypted[1].encryptedField.slice(0, 4);
        // the keys have different IDs encoded in the first 4 bytes
        expect(Buffer.compare(result1FirstBytes, result2FirstBytes)).not.toBe(0);
    });
});

describe("UNIT generateDeterministicEncryptedFieldHeader", () => {
    test("generates a stable header for a given secret ID", async () => {
        const tenantSecretId = 420;
        const header = await Crypto.generateDeterministicEncryptedFieldHeader(tenantSecretId);
        const header2 = await Crypto.generateDeterministicEncryptedFieldHeader(tenantSecretId);
        expect(header).toEqual(header2);
    });

    test("works for all input bounds", async () => {
        const header = await Crypto.generateDeterministicEncryptedFieldHeader(0);
        const expected = Buffer.from([0, 0, 0, 0, 0, 0]);
        expect(header).toEqual(expected);

        const header2 = await Crypto.generateDeterministicEncryptedFieldHeader(4294967295);
        const expected2 = Buffer.from([255, 255, 255, 255, 0, 0]);
        expect(header2).toEqual(expected2);
    });

    test("roundtrips with decomposeDeterministicField", async () => {
        const tenantSecretId = 420;
        const header = await Crypto.generateDeterministicEncryptedFieldHeader(tenantSecretId);
        const decomposed = await Crypto.decomposeDeterministicField(header);
        expect(decomposed.tenantSecretId).toBe(tenantSecretId);
    });

    test("fails for out of bounds", async () => {
        const header = Crypto.generateDeterministicEncryptedFieldHeader(4294967296);
        await expect(header).rejects.toThrow("generate header");
    });
});
