import {clearUndefinedProperties} from "../Util";

interface MetadataJson {
    tenantId: string;
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

class Metadata {
    tenantId: string;
    requestingUserOrServiceId: string;
    dataLabel?: string;
    sourceIp?: string;
    objectId?: string;
    requestId?: string;
    otherData: Record<string, string>;

    /**
     * Constructor for Metadata class which contains arbitrary key/value pairs and a unique
     * request ID to send to the Tenant Security Proxy.
     * @param tenantId                  Unique ID of tenant that is performing the operation.
     * @param requestingUserOrServiceId Unique ID of user/service that is processing data.
     * @param dataLabel                 Classification of data being processed.
     * @param sourceIp                  IP address of the initiator of this request.
     * @param objectId                  ID of the object being acted on in the host system.
     * @param requestId                 Unique ID that ties host application request ID to Tenant
     *                                  Security Proxy logs.
     * @param otherData                 Additional String key/value pairs to add to metadata.
     * @throws                          If any of the required fields aren't set.
     */
    constructor(
        tenantId: string,
        requestingUserOrServiceId: string,
        dataLabel?: string,
        sourceIp?: string,
        objectId?: string,
        requestId?: string,
        otherData?: Record<string, string>
    ) {
        if (!tenantId) {
            throw new Error("Must provide a valid tenantId for all CMK operations.");
        }
        if (!requestingUserOrServiceId) {
            throw new Error("Must provide a valid requestingUserOrServiceId for all CMK operations.");
        }
        this.tenantId = tenantId;
        this.requestingUserOrServiceId = requestingUserOrServiceId;
        this.dataLabel = dataLabel;
        this.sourceIp = sourceIp;
        this.objectId = objectId;
        this.requestId = requestId;
        this.otherData = otherData || {};
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types*/
    toJsonStructure = () => {
        const json: MetadataJson = {
            tenantId: this.tenantId,
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

/**
 * Holds metadata fields as part of encrypted data. Each encrypted document will have
 * metadata that associates it to a tenant ID, which service is accessing the data, its
 * classification label, as well as optional fields for other arbitrary key/value pairs and a request ID
 * to send to the Tenant Security Proxy.
 */
export class DocumentMetadata extends Metadata {}

/**
 * Holds metadata fields as part of encrypted data. Each encrypted field will have
 * metadata that associates it to a tenant ID, which service is accessing the data, its
 * classification label, as well as optional fields for other arbitrary key/value pairs and a request ID
 * to send to the Tenant Security Proxy.
 */
export class FieldMetadata extends Metadata {}
