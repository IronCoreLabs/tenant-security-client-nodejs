module.exports = {
    clearMocks: true,
    restoreMocks: true,
    errorOnDeprecated: true,
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: -10,
        },
    },
    //Use ts-jest for all .ts files
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "(\\.|/)(test)\\.(js|ts)$",
    moduleFileExtensions: ["ts", "js", "json"],
    testEnvironment: "node",
    setupFilesAfterEnv: ["./src/tests/jestSetup.ts"],
};
