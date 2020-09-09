# Tenant Security Client NodeJS

A NodeJS client SDK for implementing Customer Managed Keys (CMK) within a vendor's infrastructure.
This SDK is inserted into your application. Once it is initialized properly, it makes requests through the
[IronCore Tenant Security Proxy](https://gcr.io/ironcore-images/tenant-security-proxy) to tenants' KMS and logging infrastructures.


More extensive documentation about usage is available on our [docs site](https://ironcorelabs.com/docs/saas-shield/tenant-security-client/overview/).

## Installation

```
npm install @ironcorelabs/tenant-security-nodejs
```

### Running a Tenant Security Proxy

See our [TSP documentation](https://ironcorelabs.com/docs/saas-shield/tenant-security-proxy/overview) for information about how to get your own TSP running to test against.

### Documentation

See our documentation on the [IronCore website](http://ironcorelabs.com/docs/saas-shield/tenant-security-client/node-sdk/).

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

## Examples

Check in the `examples` subdirectory - there are subdirectories for some example Node programs that demonstrate a few of the ways you can use the TSC in your code to secure data.

## License

The Tenant Security Client is licensed under the [GNU Affero General Public License](https://github.com/IronCoreLabs/ironoxide/blob/master/LICENSE). We also offer commercial licenses - [email](mailto:info@ironcorelabs.com) for more information.

Copyright (c) 2020 IronCore Labs, Inc. All rights reserved.
