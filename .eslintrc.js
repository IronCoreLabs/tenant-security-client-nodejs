module.exports = {
    root: true,
    env: {
        node: true,
        commonjs: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/eslint-recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/explicit-function-return-type": 0,
    },
};
