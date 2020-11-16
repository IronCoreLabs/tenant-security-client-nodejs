import {AdminEvent, EventMetadata, TenantSecurityClient, UserEvent} from "@ironcorelabs/tenant-security-nodejs";
import {DocumentMetadata} from "@ironcorelabs/tenant-security-nodejs";

// In order to communicate with the TSP, you need a matching API_KEY. Find the right value from
// end of the TSP configuration file, and set the API_KEY environment variable to that value.
const API_KEY = process.env.API_KEY;

if (API_KEY === undefined) {
    console.log("Must set the API_KEY environment variable.");
    process.exit(1);
}

// For this example, make sure you use a tenant that has security event logging enabled so you can
// actually see the events logged to the appropriate SIEM.
let TENANT_ID = process.env.TENANT_ID;

if (TENANT_ID === undefined) {
    TENANT_ID = "tenant-gcp";
}
console.log(`Using tenant ${TENANT_ID}.`);

// Initialize the client with a Tenant Security Proxy domain and API key.
// Typically this would be done once when the application or service initializes
const client = new TenantSecurityClient("http://localhost:32804", API_KEY);

//
// Example 1: logging a user-related event
//
// Create metadata about the event. This example populates all possible fields with a value, including the
// otherData map. Sets the timestamp to 5 seconds before the current data/time.
const metadata1 = new EventMetadata(TENANT_ID, "userId1", "PII", Date.now() - 5000, "127.0.0.1", "userId1", "Rq8675309");
client
    .logSecurityEvent(UserEvent.LOGIN, metadata1)
    .then((logResult) => {
        if (logResult === null) {
            console.log("Successfully logged user login event.");
        } else {
            console.log("Error logging user login event: ${logResult}");
        }
    });

//
// Example 2: logging an admin-related event
//
// This one adds minimal metadata for the event. The timestamp should be roughly 5 seconds after the one on
// the previous event.
const metadata2 = new EventMetadata(TENANT_ID, "adminId1", undefined, undefined, undefined, "newAdmin2");
client
    .logSecurityEvent(AdminEvent.ADD, metadata2)
    .then((logResult) => {
        if (logResult === null) {
            console.log("Successfully logged admin add event.");
        } else {
            console.log("Error logging admin add event: ${logResult}");
        }
    });

// You should be able to find these two events in the logs of the SIEM associated with the tenant you specified.
