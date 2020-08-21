import {RequestMetadata} from "../RequestMetadata";

describe("UNIT RequestMetdata", () => {
    test("construction fails when invalid arguments are provided", () => {
        expect(() => new RequestMetadata(undefined as any, undefined as any, undefined as any)).toThrow();
        expect(() => new RequestMetadata("tenantId", undefined as any, undefined as any)).toThrow();
        expect(() => new RequestMetadata("tenantId", "userOrService", undefined as any)).toThrow();
        expect(() => new RequestMetadata("tenantId", "userOrService", "dataLabel")).not.toThrow();
    });

    test("returns expected JSON structure", () => {
        const simpleMeta = new RequestMetadata("tenantId", "user", "label");
        expect(simpleMeta.toJsonStructure()).toEqual({
            tenantID: "tenantId",
            requestingID: "user",
            dataLabel: "label",
        });

        const withAddedFields = new RequestMetadata("tenantId", "user", "label", "rayId", {foo: "bar", one: "two"});

        expect(withAddedFields.toJsonStructure()).toEqual({
            tenantID: "tenantId",
            requestingID: "user",
            dataLabel: "label",
            requestID: "rayId",
            customFields: {foo: "bar", one: "two"},
        });
    });
});
