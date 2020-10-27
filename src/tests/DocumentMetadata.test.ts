import {DocumentMetadata} from "../kms/DocumentMetadata";

describe("UNIT DocumentMetdata", () => {
    test("construction fails when invalid arguments are provided", () => {
        expect(() => new DocumentMetadata(undefined as any, undefined as any, undefined as any)).toThrow();
        expect(() => new DocumentMetadata("tenantId", undefined as any, undefined as any)).toThrow();
        expect(() => new DocumentMetadata("tenantId", "userOrService", undefined as any)).toThrow();
        expect(() => new DocumentMetadata("tenantId", "userOrService", "dataLabel")).not.toThrow();
    });

    test("returns expected JSON structure", () => {
        const simpleMeta = new DocumentMetadata("tenantId", "user", "label");
        expect(simpleMeta.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            requestingId: "user",
            dataLabel: "label",
        });

        const withAddedFields = new DocumentMetadata("tenantId", "user", "label", undefined, undefined, "rayId", {foo: "bar", one: "two"});

        expect(withAddedFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            requestingId: "user",
            dataLabel: "label",
            requestId: "rayId",
            customFields: {foo: "bar", one: "two"},
        });
    });
});
