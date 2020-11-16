import {EventMetadata} from "../../index";

describe("UNIT EventMetadata", () => {
    test("construction fails when tenantId is missing.", () => {
        expect(() => new EventMetadata(undefined as any, undefined as any)).toThrow();
        expect(() => new EventMetadata("tenantId", undefined as any)).toThrow();
        expect(() => new EventMetadata(undefined as any, "requestingUserOrServiceId")).toThrow();
        expect(() => new EventMetadata("tenantId", "requestingUserOrServiceId")).not.toThrow();
    });

    test("returns expected JSON structure", () => {
        const simpleMeta = new EventMetadata("tenantId", "user", "label", 1603911546500);
        expect(simpleMeta.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            timestampMillis: 1603911546500,
            iclFields: {
                requestingId: "user",
                dataLabel: "label",
            },
            customFields: {},
        });

        const withAddedFields = new EventMetadata("tenantId", "user", "label", 1603911546500, "8.8.8.8", "myDocumentId", "rayId", {
            foo: "bar",
            one: "two",
        });

        expect(withAddedFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            timestampMillis: 1603911546500,
            iclFields: {dataLabel: "label", requestId: "rayId", sourceIp: "8.8.8.8", objectId: "myDocumentId", requestingId: "user"},
            customFields: {foo: "bar", one: "two"},
        });
    });

    test("returns expected partial JSON structure", () => {
        const withPartialFields = new EventMetadata("tenantId", "user", "label", 1603911546500, undefined, "myDocumentId", "rayId", {foo: "bar", one: "two"});

        expect(withPartialFields.toJsonStructure()).toEqual({
            tenantId: "tenantId",
            timestampMillis: 1603911546500,
            iclFields: {
                requestId: "rayId",
                objectId: "myDocumentId",
                requestingId: "user",
                dataLabel: "label",
            },
            customFields: {foo: "bar", one: "two"},
        });
    });

    test("defaults timestamp to something close to now", () => {
        const withPartialFields = new EventMetadata("tenantId", "user", "label");
        const now = Date.now();

        expect(withPartialFields.toJsonStructure().timestampMillis).toBeWithin(now - 1000, now + 1000);
    });
});
