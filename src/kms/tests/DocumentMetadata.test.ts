import {DocumentMetadata} from "../../index";

describe("UNIT DocumentMetadata", () => {
    test("construction fails when tenantId is missing.", () => {
        expect(() => new DocumentMetadata(undefined as any, undefined as any)).toThrow();
        expect(() => new DocumentMetadata("tenantId", undefined as any)).toThrow();
        expect(() => new DocumentMetadata(undefined as any, "requestingUserOrServiceId")).toThrow();
        expect(() => new DocumentMetadata("tenantId", "requestingUserOrServiceId")).not.toThrow();
    });

    test("returns expected JSON structure", () => {
        const simpleMeta = new DocumentMetadata("tenantId", "user", "label");
        expect(simpleMeta.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            iclFields: {
                requestingId: "user",
                dataLabel: "label",
            },
            customFields: {},
        });

        const withAddedFields = new DocumentMetadata("tenantId", "user", "label", "8.8.8.8", "myDocumentId", "rayId", {foo: "bar", one: "two"});

        expect(withAddedFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            iclFields: {dataLabel: "label", requestId: "rayId", sourceIp: "8.8.8.8", objectId: "myDocumentId", requestingId: "user"},
            customFields: {foo: "bar", one: "two"},
        });
    });

    test("returns expected partial JSON structure", () => {
        const withPartialFields = new DocumentMetadata("tenantId", "user", "label", undefined, "myDocumentId", "rayId", {foo: "bar", one: "two"});

        expect(withPartialFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            iclFields: {
                requestId: "rayId",
                objectId: "myDocumentId",
                requestingId: "user",
                dataLabel: "label",
            },
            customFields: {foo: "bar", one: "two"},
        });
    });
});
