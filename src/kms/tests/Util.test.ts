import {verifyHasPrimaryConfig} from "../Util";
import {TenantSecurityErrorCode} from "../../TenantSecurityException";

describe("UNIT Util", () => {
    describe("verifyHasPrimaryConfig", () => {
        test("succeeds for true", async () => {
            const input = {hasPrimaryConfig: true};
            const result = await verifyHasPrimaryConfig(input, TenantSecurityErrorCode.UNKNOWN_ERROR);
            expect(result).toBe(input);
        });
        test("errors for false", async () => {
            const input = {hasPrimaryConfig: false};
            await expect(verifyHasPrimaryConfig(input, TenantSecurityErrorCode.UNKNOWN_ERROR)).rejects.toThrow("no primary");
        });
    });
});
