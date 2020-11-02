import {DocumentMetadata} from "../../index";

describe("UNIT DocumentMetdata", () => {
    test("construction fails when tenantId is missing.", () => {
        expect(() => new DocumentMetadata(undefined as any)).toThrow();
        expect(() => new DocumentMetadata("tenantId")).not.toThrow();
    });

    test("returns expected JSON structure", () => {
        const simpleMeta = new DocumentMetadata("tenantId", "user", "label");
        expect(simpleMeta.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            requestingId: "user",
            dataLabel: "label",
            customFields: {},
        });

        const withAddedFields = new DocumentMetadata("tenantId", "user", "label", "8.8.8.8", "myDocumentId", "rayId", {foo: "bar", one: "two"});

        expect(withAddedFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            requestingId: "user",
            dataLabel: "label",
            requestId: "rayId",
            sourceIp: "8.8.8.8",
            objectId: "myDocumentId",
            customFields: {foo: "bar", one: "two"},
        });
    });

    test("returns expected partial JSON structure", () => {
        const withPartialFields = new DocumentMetadata("tenantId", "user", "label", undefined, "myDocumentId", "rayId", {foo: "bar", one: "two"});

        expect(withPartialFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            requestingId: "user",
            dataLabel: "label",
            requestId: "rayId",
            objectId: "myDocumentId",
            customFields: {foo: "bar", one: "two"},
        });
    });
});
