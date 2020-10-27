import Future from "futurejs";
import {TenantSecurityException} from "../TenantSecurityException";
import {makeJsonRequest} from "../Util";
import {EventMetadata} from "./EventMetadata";
import {SecurityEvent} from "./SecurityEvent";

const SECURITY_EVENT_ENDPOINT = "event/security-event";

/**
 * Request to the security event endpoint with the provided event and metadata.
 *
 * @param event    Security event representing the action to be logged.
 * @param metadata Metadata associated with the security event.
 * @return         Void on success. Failures come back as exceptions.
 */
export const logSecurityEvent = (tspDomain: string, apiKey: string, event: SecurityEvent, metadata: EventMetadata): Future<TenantSecurityException, void> =>
    makeJsonRequest(tspDomain, apiKey, SECURITY_EVENT_ENDPOINT, JSON.stringify(combinePostableEventAndMetadata(event, metadata)));

const combinePostableEventAndMetadata = (event: SecurityEvent, metadata: EventMetadata) => {
    const postData = metadata.toJsonStructure();
    // Add the object of this call, the event, to the post data that's ready to go out.
    // We just created this, so we know the cast is safe. There is a unit case to catch this in
    // case it changes.
    postData.iclFields.event = event.getFlatEvent();
    return postData;
};
