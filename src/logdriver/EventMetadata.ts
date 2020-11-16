import {clearUndefinedProperties} from "../Util";

export interface EventMetadataJson {
    tenantId: string;
    timestampMillis: number;
    iclFields: {
        requestId?: string;
        event?: string;
        sourceIp?: string;
        objectId?: string;
        requestingId: string;
        dataLabel?: string;
    };
    customFields: Record<string, string>;
}

/**
 * Holds metadata fields as part of a security event. Each event will have metadata that associates
 * it to a tenant ID, which service is originating the event, its classification, as well as optional
 * fields for other arbitrary key/value pairs and a request ID to send to the Tenant Security Proxy.
 */
export class EventMetadata {
    tenantId: string;
    requestingUserOrServiceId: string;
    dataLabel?: string;
    timestampMillis: number;
    sourceIp?: string;
    objectId?: string;
    requestId?: string;
    otherData: Record<string, string>;

    /**
     * Constructor for EventMetadata class which contains arbitrary key/value pairs and a unique
     * request ID to send to the Tenant Security Proxy.
     *
     * @param tenantId                  Unique ID of tenant that is performing the operation.
     * @param requestingUserOrServiceId Unique ID of user/service that triggered the event.
     * @param dataLabel                 Classification of the event if more than the event category
     *                                  is needed.
     * @param timestampMillis           Linux epoch millis of when the event occured. If this isn't
     *                                  passed, now will be assumed.
     * @param sourceIp                  IP address of the initiator of the event.
     * @param objectId                  ID of the object being acted on when the event occured.
     * @param requestId                 Unique ID that ties host application request ID to Tenant
     *                                  Security Proxy logs.
     * @param otherData                 Additional String key/value pairs to add to metadata.
     * @throws                          If any of the required parameters or missing.
     */
    constructor(
        tenantId: string,
        requestingUserOrServiceId: string,
        dataLabel?: string,
        timestampMillis?: number,
        sourceIp?: string,
        objectId?: string,
        requestId?: string,
        otherData?: Record<string, string>
    ) {
        if (!tenantId) {
            throw new Error("Must provide a valid tenantId for all Security Event operations.");
        }
        if (!requestingUserOrServiceId) {
            throw new Error("Must provide a valid requestingUserOrServiceId for all CMK operations.");
        }
        this.tenantId = tenantId;
        this.requestingUserOrServiceId = requestingUserOrServiceId;
        this.dataLabel = dataLabel;
        this.timestampMillis = timestampMillis || Date.now();
        this.sourceIp = sourceIp;
        this.objectId = objectId;
        this.requestId = requestId;
        this.otherData = otherData || {};
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types*/
    toJsonStructure = () => {
        const json: EventMetadataJson = {
            tenantId: this.tenantId,
            timestampMillis: this.timestampMillis,
            iclFields: {
                sourceIp: this.sourceIp,
                objectId: this.objectId,
                requestingId: this.requestingUserOrServiceId,
                dataLabel: this.dataLabel,
                requestId: this.requestId,
            },
            customFields: this.otherData,
        };
        return clearUndefinedProperties(json);
    };
}
