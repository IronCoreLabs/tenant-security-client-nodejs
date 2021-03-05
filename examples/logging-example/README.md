# Logging Example

In order to run this example, you need to be running a _Tenant Security Proxy_ (TSP) on your machine.
Check the [README.md](../README.md) file in the parent directory to see how to start the TSP, if you haven't done so
yet.

Once the TSP is running, you can experiment with this example Node program. It illustrates the basics of how
to use the Tenant Security Client (TSC) SDK to log security events. The example code shows two scenarios:

-   logging a login security event with additional metadata
-   logging an admin create security event with minimal metadata

To run the example, you will need to have Node installed on your computer. Try a `node -v` to see
what version you are using. We tested the example code using v10.22.0 and v12.0.0.

If node is ready to go, execute these commands:

```bash
export API_KEY='0WUaXesNgbTAuLwn'
yarn
yarn start
```

We've assigned an API key for you, but in production you will make your own and edit the TSP
configuration with it. This should produce output like:

```bash
yarn run v1.22.5
$ yarn tsc --target ES6 --sourceMap false --module CommonJS --outDir ./dist/src src/index.ts && node dist/src/index.js
$ /home/craig/Repos/tenant-security-client-nodejs/examples/logging-example/node_modules/.bin/tsc --target ES6 --sourceMap false --module CommonJS --outDir ./dist/src src/index.ts
Using tenant tenant-gcp-l.
Successfully logged admin add event.
Successfully logged user login event.
Done in 3.80s.
```

The output "Successfully logged admin add event" is printed after successfully sending the admin add event
to the TSP. Same thing with "Successfully logged user login event" but for the login event.

If you look in the TSP logs you should see something like:

```bash
{"service":"proxy","message":"Security Event Received","level":"INFO","timestamp":"2021-03-03T20:13:00.502269399+00:00","tenant_id":"tenant-gcp-l","rayid":"mkrWLrYq-gdRzhQe"}
{"service":"proxy","message":"Security Event Received","level":"INFO","timestamp":"2021-03-03T20:13:00.502294948+00:00","tenant_id":"tenant-gcp-l","rayid":"xLyf9BG2ToCbuzrJ"}
{"service":"proxy","message":"{\"iclFields\":{\"dataLabel\":\"PII\",\"requestId\":\"Rq8675309\",\"requestingId\":\"userId1\",\"sourceIp\":\"127.0.0.1\",\"objectId\":\"userId1\",\"event\":\"USER_LOGIN\"},\"customFields\":{\"field2\":\"pokey\",\"field1\":\"gumby\"}}","level":"INFO","timestamp":"2021-03-03T20:13:00.502315310+00:00","tenant_id":"tenant-gcp-l","rayid":"xLyf9BG2ToCbuzrJ"}
{"service":"proxy","message":"{\"iclFields\":{\"dataLabel\":null,\"requestId\":null,\"requestingId\":\"adminId1\",\"sourceIp\":null,\"objectId\":\"newAdmin2\",\"event\":\"ADMIN_ADD\"},\"customFields\":{}}","level":"INFO","timestamp":"2021-03-03T20:13:00.502334931+00:00","tenant_id":"tenant-gcp-l","rayid":"mkrWLrYq-gdRzhQe"}
{"service":"logdriver","message":"Making request to Stackdriver to write 2 log entries.","level":"INFO","timestamp":"2021-03-03T20:13:02.630478837+00:00","tenant_id":"tenant-gcp-l"}
{"service":"logdriver","message":"Successfully wrote 2 log entries to Stackdriver.","level":"INFO","timestamp":"2021-03-03T20:13:02.850532340+00:00","tenant_id":"tenant-gcp-l"}
```

This shows the TSP receiving these events, batching them up together, and sending them successfully to Stackdriver (the configured log sink for
`tenant-gcp-l`).

If you would like to experiment with a different tenant, just do:

```bash
export TENANT_ID=<selected-tenant-ID>
yarn start
```

The list of available tenants is listed in the [README.md](../README.md) in the parent directory.

## Additional Resources

If you would like some more in-depth information, our website features a section of technical
documentation about the [SaaS Shield product](https://ironcorelabs.com/docs/saas-shield/).
