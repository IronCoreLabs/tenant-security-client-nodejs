import * as Crypto from "../Crypto";

describe("UNIT deterministicEncryptDocument", () => {
    test("roundtrips when given valid key", async () => {
        const doc = {field: Buffer.from("aaaaaa")};
        const key = [
            {
                derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=",
                tenantSecretId: "aaa",
                tenantSecretNumericId: 5,
                primary: true,
            },
        ];
        const encrypted1 = await Crypto.deterministicEncryptDocument(doc, key, "", "tenant");
        const encrypted2 = await Crypto.deterministicEncryptDocument(doc, key, "", "tenant");
        expect(encrypted1.field.data).toEqual(encrypted2.field.data);

        const decrypted = await Crypto.deterministicDecryptDocument(encrypted1, key);
        expect(decrypted.field).toEqual(doc.field);
    });

    test("errors when no primary key found", async () => {
        const doc = {field: Buffer.from("aaaaaa")};
        const key = [
            {
                derivedKey: "XEECPt9kGfeATh95LuV3k+UO63CXxLnk0dPXgGK6FVY=",
                tenantSecretId: "aaa",
                tenantSecretNumericId: 5,
                primary: false,
            },
        ];
        await expect(Crypto.deterministicEncryptDocument(doc, key, "", "tenant")).rejects.toThrow("Could not find primary");
    });
});
