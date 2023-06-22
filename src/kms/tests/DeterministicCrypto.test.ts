import * as DetCrypto from "../DeterministicCrypto";
import {DeterministicEncryptedField} from "../../Util";

const plaintextField = {plaintextField: Buffer.from("aaaaaa"), derivationPath: "path1", secretPath: "path2"};

const derivedKeys = [
    {
        derivedKey: "g2K8P7zoxO+yi4oDcR5Bk4grNuHFUBgqJ2Jgbh2bJzDk2Z/z8ji5WvF8aO2n/iUBl8tbKiaIs2n7R9vIBrXGmg==",
        tenantSecretId: 5,
        current: true,
    },
    {
        derivedKey: "AUvYQZVvGpqalGZyO7Sy5WSsJ9KqOkwP/jlQnvORy/hZVU1pTCLefEPKJ4mShUfdKOKbECMpuf7YpR9+CNwuEQ==",
        tenantSecretId: 6,
        current: false,
    },
];

describe("UNIT encryptField", () => {
    test("roundtrips when given valid key", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        const decrypted = await DetCrypto.decryptField(encrypted, derivedKeys);
        expect(decrypted.plaintextField).toEqual(plaintextField.plaintextField);
    });

    test("is stable for a given key/plaintext", async () => {
        const encrypted1 = await DetCrypto.encryptField(plaintextField, derivedKeys);
        const encrypted2 = await DetCrypto.encryptField(plaintextField, derivedKeys);
        expect(encrypted1.encryptedField).toEqual(encrypted2.encryptedField);
    });

    test("errors when no current key found", async () => {
        const key = [
            {
                derivedKey: "g2K8P7zoxO+yi4oDcR5Bk4grNuHFUBgqJ2Jgbh2bJzDk2Z/z8ji5WvF8aO2n/iUBl8tbKiaIs2n7R9vIBrXGmg==",
                tenantSecretId: 5,
                current: false,
            },
        ];
        await expect(DetCrypto.encryptField(plaintextField, key)).rejects.toThrow("Failed deterministic encryption");
    });

    test("errors if derivedKey isn't valid base64", async () => {
        const derivedKeys = [
            {
                derivedKey: "!!!!!",
                tenantSecretId: 5,
                current: true,
            },
        ];
        await expect(DetCrypto.encryptField(plaintextField, derivedKeys)).rejects.toThrow("got 0");
    });
});

describe("UNIT encryptBytes", () => {
    // Values from Deterministic Authenticated Encryption Example at https://datatracker.ietf.org/doc/html/rfc5297#appendix-A.1
    test("roundtrips when given valid key", async () => {
        const key = Buffer.from("fffefdfcfbfaf9f8f7f6f5f4f3f2f1f0f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff", "hex");
        const associatedData = Buffer.from("101112131415161718191a1b1c1d1e1f2021222324252627", "hex");
        const plaintext = Buffer.from("112233445566778899aabbccddee", "hex");
        const encrypted = await DetCrypto.encryptBytes(plaintext, key, [associatedData]);
        const expected = Buffer.from("85632d07c6e8f37f950acd320a2ecc9340c02b9690c4dc04daef7f6afe5c", "hex");
        expect(encrypted).toEqual(expected);
        const decrypted = await DetCrypto.decryptBytes(encrypted, key, [associatedData]);
        expect(decrypted).toEqual(plaintext);
    });
});

describe("UNIT generateEncryptedFieldHeader", () => {
    test("works for valid tenantSecretId", async () => {
        const header = await DetCrypto.generateEncryptedFieldHeader(4);
        const expected = Buffer.from([0, 0, 0, 4, 0, 0]);
        expect(header).toEqual(expected);
    });

    test("fails for invalid tenantSecretId", async () => {
        await expect(DetCrypto.generateEncryptedFieldHeader(-1)).rejects.toThrow("Failed to generate header");
        await expect(DetCrypto.generateEncryptedFieldHeader(9999999999)).rejects.toThrow("Failed to generate header");
    });
});

describe("UNIT batch", () => {
    test("batch encrypt roundtrips with regular decrypt", async () => {
        const collection = {fieldId: plaintextField, fieldId2: plaintextField};
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {path2: {path1: derivedKeys}},
        };
        const batchResult = await DetCrypto.batchEncryptField(collection, deriveKeysResponse);
        expect(batchResult.hasFailures).toBeFalse();
        expect(batchResult.hasSuccesses).toBeTrue();
        const decrypted1 = await DetCrypto.decryptField(batchResult.successes.fieldId, derivedKeys);
        const decrypted2 = await DetCrypto.decryptField(batchResult.successes.fieldId2, derivedKeys);
        expect(decrypted1.plaintextField).toEqual(plaintextField.plaintextField);
        expect(decrypted2.plaintextField).toEqual(plaintextField.plaintextField);
    });

    test("batch encrypt roundtrips with batch decrypt", async () => {
        const collection = {fieldId: plaintextField, fieldId2: plaintextField};
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {path2: {path1: derivedKeys}},
        };
        const batchEncryptResult = await DetCrypto.batchEncryptField(collection, deriveKeysResponse);
        expect(batchEncryptResult.hasFailures).toBeFalse();
        expect(batchEncryptResult.hasSuccesses).toBeTrue();
        const batchDecryptResult = await DetCrypto.batchDecryptField(batchEncryptResult.successes, deriveKeysResponse);
        expect(batchDecryptResult.hasFailures).toBeFalse();
        expect(batchDecryptResult.hasSuccesses).toBeTrue();
        expect(batchDecryptResult.successes.fieldId.plaintextField).toEqual(plaintextField.plaintextField);
    });

    test("errors when no current key found for secret/derivation paths", async () => {
        const collection = {fieldId: plaintextField};
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {badPath: {path1: derivedKeys}},
        };
        const batchResult = await DetCrypto.batchEncryptField(collection, deriveKeysResponse);
        expect(batchResult.hasSuccesses).toBeFalse();
        expect(batchResult.hasFailures).toBeTrue();
        expect(batchResult.failures.fieldId.message).toContain("Failed to derive");
    });

    test("gives partial failure for crypto error", async () => {
        const collection = {fieldId: plaintextField, fieldId2: plaintextField};
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {path2: {path1: derivedKeys}},
        };
        const batchEncryptResult = await DetCrypto.batchEncryptField(collection, deriveKeysResponse);
        expect(batchEncryptResult.hasFailures).toBeFalse();
        expect(batchEncryptResult.hasSuccesses).toBeTrue();
        // slice off the det enc header
        const field1 = batchEncryptResult.successes.fieldId as DeterministicEncryptedField;
        const ruinedFieldBytes = field1.encryptedField.slice(6);
        const ruinedField = {
            secretPath: field1.secretPath,
            derivationPath: field1.derivationPath,
            encryptedField: ruinedFieldBytes,
        };
        const encryptedCollection = {fieldId: ruinedField, fieldId2: batchEncryptResult.successes.fieldId2 as DeterministicEncryptedField};
        const batchDecryptResult = await DetCrypto.batchDecryptField(encryptedCollection, deriveKeysResponse);
        expect(batchDecryptResult.hasFailures).toBeTrue();
        expect(batchDecryptResult.hasSuccesses).toBeTrue();
        expect(batchDecryptResult.successes.fieldId2.plaintextField).toEqual(plaintextField.plaintextField);
        expect(batchDecryptResult.failures.fieldId.message).toContain("parse field header");
    });

    test("batch rotate field roundtrips with regular decrypt", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        const collection = {fieldId: encrypted};
        const newDerivedKeys = [
            {
                derivedKey: "g2K8P7zoxO+yi4oDcR5Bk4grNuHFUBgqJ2Jgbh2bJzDk2Z/z8ji5WvF8aO2n/iUBl8tbKiaIs2n7R9vIBrXGmg==",
                tenantSecretId: 5,
                current: false,
            },
            {
                derivedKey: "AUvYQZVvGpqalGZyO7Sy5WSsJ9KqOkwP/jlQnvORy/hZVU1pTCLefEPKJ4mShUfdKOKbECMpuf7YpR9+CNwuEQ==",
                tenantSecretId: 6,
                current: true, // different current
            },
        ];
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {path2: {path1: newDerivedKeys}},
        };
        const batchResult = await DetCrypto.batchRotateField(collection, deriveKeysResponse);
        expect(batchResult.hasFailures).toBeFalse();
        expect(batchResult.hasSuccesses).toBeTrue();
        const decrypted = await DetCrypto.decryptField(batchResult.successes.fieldId, derivedKeys);
        expect(decrypted.plaintextField).toEqual(plaintextField.plaintextField);
    });

    test("batch search returns encrypted field for each derived key", async () => {
        const collection = {fieldId: plaintextField, fieldId2: plaintextField};
        const deriveKeysResponse = {
            hasPrimaryConfig: true,
            derivedKeys: {path2: {path1: derivedKeys}},
        };
        const batchResult = await DetCrypto.batchGenerateSearchTerms(collection, deriveKeysResponse);
        expect(batchResult.hasFailures).toBeFalse();
        expect(batchResult.hasSuccesses).toBeTrue();
        expect(batchResult.successes.fieldId.length).toBe(2);
        expect(batchResult.successes.fieldId2.length).toBe(2);
    });
});

describe("UNIT checkRotationFieldNoOp", () => {
    // switched current compared to `derivedKeys`
    const newDerivedKeys = [
        {
            derivedKey: "g2K8P7zoxO+yi4oDcR5Bk4grNuHFUBgqJ2Jgbh2bJzDk2Z/z8ji5WvF8aO2n/iUBl8tbKiaIs2n7R9vIBrXGmg==",
            tenantSecretId: 5,
            current: false,
        },
        {
            derivedKey: "AUvYQZVvGpqalGZyO7Sy5WSsJ9KqOkwP/jlQnvORy/hZVU1pTCLefEPKJ4mShUfdKOKbECMpuf7YpR9+CNwuEQ==",
            tenantSecretId: 6,
            current: true,
        },
    ];
    test("works for noop case", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        const noop = await DetCrypto.checkRotationFieldNoOp(encrypted, derivedKeys);
        expect(noop).toBeTrue();
    });

    test("works for non-noop case", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        const noop = await DetCrypto.checkRotationFieldNoOp(encrypted, newDerivedKeys);
        expect(noop).toBeFalse();
    });

    test("fails if current can't be found", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        await expect(DetCrypto.checkRotationFieldNoOp(encrypted, newDerivedKeys.slice(0, 1))).rejects.toThrow("rotation");
    });

    test("fails if old key can't be found", async () => {
        const encrypted = await DetCrypto.encryptField(plaintextField, derivedKeys);
        await expect(DetCrypto.checkRotationFieldNoOp(encrypted, newDerivedKeys.slice(1))).rejects.toThrow("rotation");
    });
});

describe("UNIT generateEncryptedFieldHeader", () => {
    test("generates a stable header for a given secret ID", async () => {
        const tenantSecretId = 420;
        const header = await DetCrypto.generateEncryptedFieldHeader(tenantSecretId);
        const header2 = await DetCrypto.generateEncryptedFieldHeader(tenantSecretId);
        expect(header).toEqual(header2);
    });

    test("works for all input bounds", async () => {
        const header = await DetCrypto.generateEncryptedFieldHeader(0);
        const expected = Buffer.from([0, 0, 0, 0, 0, 0]);
        expect(header).toEqual(expected);

        const header2 = await DetCrypto.generateEncryptedFieldHeader(4294967295);
        const expected2 = Buffer.from([255, 255, 255, 255, 0, 0]);
        expect(header2).toEqual(expected2);
    });

    test("roundtrips with decomposeField", async () => {
        const tenantSecretId = 420;
        const header = await DetCrypto.generateEncryptedFieldHeader(tenantSecretId);
        const decomposed = await DetCrypto.decomposeField(header);
        expect(decomposed.tenantSecretId).toBe(tenantSecretId);
    });

    test("fails for out of bounds", async () => {
        const header = DetCrypto.generateEncryptedFieldHeader(4294967296);
        await expect(header).rejects.toThrow("generate header");
    });
});

describe("UNIT decomposeField", () => {
    test("works for valid header/field", async () => {
        const encrypted = Buffer.from([0, 0, 0, 4, 0, 0, 1, 1, 1]);
        const parts = await DetCrypto.decomposeField(encrypted);
        expect(parts.tenantSecretId).toBe(4);
        const expectedEncryptedBytes = Buffer.from([1, 1, 1]);
        expect(parts.encryptedBytes).toEqual(expectedEncryptedBytes);
    });

    test("fails for incorrect padding bytes", async () => {
        const encrypted = Buffer.from([0, 0, 0, 4, 1, 0, 1, 1, 1]);
        await expect(DetCrypto.decomposeField(encrypted)).rejects.toThrow("Failed to parse");
    });

    test("fails for too few bytes", async () => {
        const encrypted = Buffer.from([0, 0]);
        await expect(DetCrypto.decomposeField(encrypted)).rejects.toThrow("Failed to parse");
    });
});

describe("UNIT generateSearchTerms", () => {
    test("returns 2 entries for 2 keys", async () => {
        const encrypted = await DetCrypto.generateSearchTerms(plaintextField, derivedKeys);
        expect(encrypted.length).toBe(2);
        const result1FirstBytes = encrypted[0].encryptedField.slice(0, 4);
        const result2FirstBytes = encrypted[1].encryptedField.slice(0, 4);
        // the keys have different IDs encoded in the first 4 bytes
        expect(result1FirstBytes).not.toEqual(result2FirstBytes);
    });
});
