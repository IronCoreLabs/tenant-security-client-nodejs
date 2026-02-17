import {Response} from "node-fetch";
import {validateJsonResponse} from "../../Util";
import {TspServiceException} from "../../TspServiceException";
import {
    ApiErrorResponseSchema,
    WrapKeyResponseSchema,
    UnwrapKeyResponseSchema,
    RekeyResponseSchema,
    BatchWrapKeyResponseSchema,
    BatchUnwrapKeyResponseSchema,
    DeriveKeyResponseSchema,
    DerivedKeySchema,
    DerivedKeysSchema,
} from "../KmsApi";

// Helper to create a mock Response with JSON body
const mockResponse = (body: unknown, ok = true): Response => {
    return {
        ok,
        json: () => Promise.resolve(body),
    } as Response;
};

// Helper to extract result from Future
const toPromise = <T>(future: {toPromise: () => Promise<T>}): Promise<T> => future.toPromise();

// Helper to extract error from rejected Future
const toError = async <T>(future: {toPromise: () => Promise<T>}): Promise<TspServiceException> => {
    try {
        await future.toPromise();
        throw new Error("Expected Future to reject");
    } catch (e) {
        return e as TspServiceException;
    }
};

describe("UNIT KmsApiValidation", () => {
    describe("ApiErrorResponseSchema", () => {
        test("accepts valid error with code and message", async () => {
            const validError = {code: 100, message: "Test error"};
            const result = await toPromise(validateJsonResponse(mockResponse(validError), ApiErrorResponseSchema));
            expect(result).toEqual(validError);
        });

        test("rejects missing code", async () => {
            const invalidError = {message: "Test error"};
            const error = await toError(validateJsonResponse(mockResponse(invalidError), ApiErrorResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"code" is required');
        });

        test("rejects missing message", async () => {
            const invalidError = {code: 100};
            const error = await toError(validateJsonResponse(mockResponse(invalidError), ApiErrorResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"message" is required');
        });

        test("rejects non-number code", async () => {
            const invalidError = {code: "not-a-number", message: "Test error"};
            const error = await toError(validateJsonResponse(mockResponse(invalidError), ApiErrorResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"code" must be a number');
        });
    });

    describe("DerivedKeySchema", () => {
        test("accepts valid derived key", async () => {
            const validKey = {derivedKey: "base64string", tenantSecretId: 123, current: true};
            const result = await toPromise(validateJsonResponse(mockResponse(validKey), DerivedKeySchema));
            expect(result).toEqual(validKey);
        });

        test("rejects missing derivedKey", async () => {
            const invalidKey = {tenantSecretId: 123, current: true};
            const error = await toError(validateJsonResponse(mockResponse(invalidKey), DerivedKeySchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"derivedKey" is required');
        });

        test("rejects missing tenantSecretId", async () => {
            const invalidKey = {derivedKey: "base64string", current: true};
            const error = await toError(validateJsonResponse(mockResponse(invalidKey), DerivedKeySchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"tenantSecretId" is required');
        });

        test("rejects missing current", async () => {
            const invalidKey = {derivedKey: "base64string", tenantSecretId: 123};
            const error = await toError(validateJsonResponse(mockResponse(invalidKey), DerivedKeySchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"current" is required');
        });

        test("rejects wrong types", async () => {
            const invalidKey = {derivedKey: 123, tenantSecretId: "not-a-number", current: "not-a-boolean"};
            const error = await toError(validateJsonResponse(mockResponse(invalidKey), DerivedKeySchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });
    });

    describe("DerivedKeysSchema", () => {
        test("accepts valid derived keys structure", async () => {
            const validKeys = {
                path1: [{derivedKey: "key1", tenantSecretId: 1, current: true}],
                path2: [
                    {derivedKey: "key2", tenantSecretId: 2, current: true},
                    {derivedKey: "key3", tenantSecretId: 3, current: false},
                ],
            };
            const result = await toPromise(validateJsonResponse(mockResponse(validKeys), DerivedKeysSchema));
            expect(result).toEqual(validKeys);
        });

        test("accepts empty object", async () => {
            const result = await toPromise(validateJsonResponse(mockResponse({}), DerivedKeysSchema));
            expect(result).toEqual({});
        });

        test("rejects invalid nested DerivedKey", async () => {
            const invalidKeys = {
                path1: [{derivedKey: "key1", tenantSecretId: "not-a-number", current: true}],
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidKeys), DerivedKeysSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });
    });

    describe("WrapKeyResponseSchema", () => {
        test("accepts valid response with dek and edek", async () => {
            const validResponse = {dek: "dekValue", edek: "edekValue"};
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), WrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("rejects missing dek", async () => {
            const invalidResponse = {edek: "edekValue"};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), WrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"dek" is required');
        });

        test("rejects missing edek", async () => {
            const invalidResponse = {dek: "dekValue"};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), WrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"edek" is required');
        });

        test("rejects non-string values", async () => {
            const invalidResponse = {dek: 123, edek: "edekValue"};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), WrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"dek" must be a string');
        });
    });

    describe("UnwrapKeyResponseSchema", () => {
        test("accepts valid response with dek", async () => {
            const validResponse = {dek: "dekValue"};
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), UnwrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("rejects missing dek", async () => {
            const invalidResponse = {};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), UnwrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"dek" is required');
        });
    });

    describe("RekeyResponseSchema", () => {
        test("accepts valid response (same as WrapKeyResponse)", async () => {
            const validResponse = {dek: "dekValue", edek: "edekValue"};
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), RekeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("rejects missing dek", async () => {
            const invalidResponse = {edek: "edekValue"};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), RekeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"dek" is required');
        });

        test("rejects missing edek", async () => {
            const invalidResponse = {dek: "dekValue"};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), RekeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"edek" is required');
        });
    });

    describe("BatchWrapKeyResponseSchema", () => {
        test("accepts valid response with keys and failures", async () => {
            const validResponse = {
                keys: {
                    doc1: {dek: "dek1", edek: "edek1"},
                    doc2: {dek: "dek2", edek: "edek2"},
                },
                failures: {
                    doc3: {code: 100, message: "Wrap failed"},
                },
            };
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), BatchWrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("validates nested WrapKeyResponse in keys", async () => {
            const invalidResponse = {
                keys: {
                    doc1: {dek: "dek1"}, // missing edek
                },
                failures: {},
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchWrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain("edek");
            expect(error.message).toContain("is required");
        });

        test("validates nested ApiErrorResponse in failures", async () => {
            const invalidResponse = {
                keys: {},
                failures: {
                    doc1: {code: "not-a-number", message: "Error"}, // code should be number
                },
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchWrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain("code");
            expect(error.message).toContain("must be a number");
        });

        test("accepts empty keys/failures objects", async () => {
            const validResponse = {keys: {}, failures: {}};
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), BatchWrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("rejects invalid nested structures", async () => {
            const invalidResponse = {
                keys: {
                    doc1: {invalidKey: "value"}, // wrong structure
                },
                failures: {},
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchWrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });

        test("rejects missing keys", async () => {
            const invalidResponse = {failures: {}};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchWrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"keys" is required');
        });

        test("rejects missing failures", async () => {
            const invalidResponse = {keys: {}};
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchWrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"failures" is required');
        });
    });

    describe("BatchUnwrapKeyResponseSchema", () => {
        test("accepts valid response with keys and failures", async () => {
            const validResponse = {
                keys: {
                    doc1: {dek: "dek1"},
                    doc2: {dek: "dek2"},
                },
                failures: {
                    doc3: {code: 100, message: "Unwrap failed"},
                },
            };
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), BatchUnwrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("validates nested UnwrapKeyResponse in keys", async () => {
            const invalidResponse = {
                keys: {
                    doc1: {notDek: "value"}, // wrong field name
                },
                failures: {},
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchUnwrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });

        test("validates nested ApiErrorResponse in failures", async () => {
            const invalidResponse = {
                keys: {},
                failures: {
                    doc1: {message: "Error"}, // missing code
                },
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), BatchUnwrapKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain("code");
            expect(error.message).toContain("is required");
        });

        test("accepts empty keys/failures objects", async () => {
            const validResponse = {keys: {}, failures: {}};
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), BatchUnwrapKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });
    });

    describe("DeriveKeyResponseSchema", () => {
        test("accepts valid response with hasPrimaryConfig and derivedKeys", async () => {
            const validResponse = {
                hasPrimaryConfig: true,
                derivedKeys: {
                    secretPath1: {
                        derivationPath1: [{derivedKey: "key1", tenantSecretId: 1, current: true}],
                    },
                },
            };
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), DeriveKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });

        test("validates nested DerivedKeys structure", async () => {
            const invalidResponse = {
                hasPrimaryConfig: true,
                derivedKeys: {
                    secretPath1: {
                        derivationPath1: [{derivedKey: "key1", tenantSecretId: "not-a-number", current: true}],
                    },
                },
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });

        test("validates DerivedKey array elements", async () => {
            const invalidResponse = {
                hasPrimaryConfig: true,
                derivedKeys: {
                    secretPath1: {
                        derivationPath1: [{derivedKey: "key1"}], // missing tenantSecretId and current
                    },
                },
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });

        test("rejects invalid nested structures", async () => {
            const invalidResponse = {
                hasPrimaryConfig: true,
                derivedKeys: {
                    secretPath1: "not-an-object",
                },
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
        });

        test("rejects missing hasPrimaryConfig", async () => {
            const invalidResponse = {
                derivedKeys: {},
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"hasPrimaryConfig" is required');
        });

        test("rejects missing derivedKeys", async () => {
            const invalidResponse = {
                hasPrimaryConfig: true,
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"derivedKeys" is required');
        });

        test("rejects non-boolean hasPrimaryConfig", async () => {
            const invalidResponse = {
                hasPrimaryConfig: "not-a-boolean",
                derivedKeys: {},
            };
            const error = await toError(validateJsonResponse(mockResponse(invalidResponse), DeriveKeyResponseSchema));
            expect(error).toBeInstanceOf(TspServiceException);
            expect(error.message).toContain('"hasPrimaryConfig" must be a boolean');
        });

        test("accepts empty derivedKeys object", async () => {
            const validResponse = {
                hasPrimaryConfig: false,
                derivedKeys: {},
            };
            const result = await toPromise(validateJsonResponse(mockResponse(validResponse), DeriveKeyResponseSchema));
            expect(result).toEqual(validResponse);
        });
    });
});
