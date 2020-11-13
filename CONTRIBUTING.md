# Contributing to Tenant Security Client NodeJS

## Running a Tenant Security Proxy

See our [TSP documentation](https://ironcorelabs.com/docs/saas-shield/tenant-security-proxy/overview) for information about how to get your own TSP running to test against.

## Tests

This client has both a set of unit tests as well as several integration test suites. Because of the complexity of the various services requried to run non-unit test suites, these tests require additional setup, which is explained below.

### Unit Tests

Tests that check functionality that is contained within the client.

```
yarn test
```

#### Local Development Integration Tests

These tests are meant for local devlopers to be able to do a full end-to-end test from the client all the way through to the Config Broker. This test will perform multiple round-trip encryption and decryption tests and verify that the data is successfully decrypted to its original value. This test assumes that you've done the work of setting up the Tenant Security Proxy from above as well as setting up the associated Config Broker vendor account with a tenant and a KMS config. Open the [`LocalRoundTrip.test.ts`](src/tests/LocalRoundTrip.test.ts) file and set the values for your `LOCAL_TENANT_ID` and `LOCAL_API_KEY` within the test class. Once
set you can run them via:

```
yarn local
```

#### Complete Integration Tests

We've created a number of accounts within a Config Broker dev enviroment that have tenants set up for all the different KMS types that we support. This allows us to run a more complete suite of integration tests that exercise more parts of both the client as well as the Tenant Security Proxy. These tests are not runnable by the public. You can view the results of these test runs in [CI](https://github.com/IronCoreLabs/tenant-security-client-nodejs/actions).

## Publishing

To release a new version of the package to NPM, first update the `version` field in `package.json`.
We use *semver* semantics, so carefully consider whether the change breaks any interfaces to consumers of the package.

Once the version is updated and committed, simply run `./build.js --publish` to build and test the package, then push the package to the NPM repository.
If your account is configured to require a One-Time Passcode (OTP), add `--otp` to the command line.
When the build is complete and the script is ready to push the package, it will prompt you to enter your OTP to continue.

