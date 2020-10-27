import {clearUndefinedProperties} from "../Util";

export interface EventMetadataJson {
    tenantId: string;
    timestampMillis: number;
    iclFields: {
        requestId?: string;
        event?: string;
        sourceIp: string | undefined;
        objectId: string | undefined;
        requestingId: string;
        dataLabel: string;
    };
    customFields: Record<string, string> | undefined;
}

/**
 * Holds metadata fields as part of a security event. Each event will have metadata that associates
 * it to a tenant ID, which service is originating the event, its classification, as well as optional
 * fields for other arbitrary key/value pairs and a request ID to send to the Tenant Security Proxy.
 */
export class EventMetadata {
    tenantId: string;
    requestingUserOrServiceId: string;
    dataLabel: string;
    timestampMillis: Date;
    sourceIp?: string;
    objectId?: string;
    requestId?: string;
    otherData?: Record<string, string>;

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
        dataLabel: string,
        timestampMillis: Date,
        sourceIp?: string,
        objectId?: string,
        requestId?: string,
        otherData?: Record<string, string>
    ) {
        if (!tenantId) {
            throw new Error("Must provide a valid tenantId for all Security Event operations.");
        }
        if (!requestingUserOrServiceId) {
            throw new Error("Must provide a valid requestingUserOrServiceId for all Security Event operations.");
        }
        if (!dataLabel) {
            throw new Error("Must provide a valid dataLabel for all Security Event operations.");
        }
        if (!timestampMillis) {
            throw new Error("Must provide a valid timestampMillis for all Security Event operations.");
        }
        this.tenantId = tenantId;
        this.requestingUserOrServiceId = requestingUserOrServiceId;
        this.dataLabel = dataLabel;
        this.timestampMillis = timestampMillis;
        this.sourceIp = sourceIp;
        this.objectId = objectId;
        this.requestId = requestId;
        this.otherData = otherData;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types*/
    toJsonStructure = () => {
        const json: EventMetadataJson = {
            tenantId: this.tenantId,
            timestampMillis: this.timestampMillis.getUTCMilliseconds(),
            iclFields: {
                sourceIp: this.sourceIp,
                objectId: this.objectId,
                requestingId: this.requestingUserOrServiceId,
                dataLabel: this.dataLabel,
            },
            customFields: this.otherData,
        };
        if (this.requestId) {
            json.iclFields.requestId = this.requestId;
        }
        return clearUndefinedProperties(json);
    };
}
