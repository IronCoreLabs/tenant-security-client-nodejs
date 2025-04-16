# Tenant Security Client NodeJS

A NodeJS client SDK for implementing Customer Managed Keys (CMK) within a vendor's infrastructure.
This SDK is inserted into your application. Once it is initialized properly, it makes requests through the
[IronCore Tenant Security Proxy](https://gcr.io/ironcore-images/tenant-security-proxy) to tenants' KMS and logging infrastructures.

More extensive documentation about usage is available on our [docs site](https://ironcorelabs.com/docs/saas-shield/tenant-security-client/overview/).

## Installation

```
npm install @ironcorelabs/tenant-security-nodejs
```

### Documentation

See our documentation on the [IronCore website](http://ironcorelabs.com/docs/saas-shield/tenant-security-client/node-sdk/).

## Examples

Check in the `examples` subdirectory - there are subdirectories for some example Node programs that demonstrate a few of the ways you can use the TSC in your code to secure data.

Copyright (c) 2023 IronCore Labs, Inc. All rights reserved.
