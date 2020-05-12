module.exports = {
    clearMocks: true,
    restoreMocks: true,
    errorOnDeprecated: true,
    //Use ts-jest for all .ts files
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "(\\.|/)(test)\\.(js|ts)$",
    moduleFileExtensions: ["ts", "js", "json"],
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/jestSetup.ts"],
};
