import {clearUndefinedProperties} from "../Util";

/**
 * Holds metadata fields as part of an encrypted document. Each encrypted document will have
 * metadata that associates it to a tenant ID, which service is accessing the data, its
 * classification label, as well as optional fields for other arbitrary key/value pairs and a request ID
 * to send to the Tenant Security Proxy.
 */
export class DocumentMetadata {
    tenantId: string;
    requestingUserOrServiceId: string;
    dataLabel: string;
    sourceIp?: string;
    objectId?: string;
    requestId?: string;
    otherData?: Record<string, string>;

    /**
     * Constructor for DocumentMetadata class which contains arbitrary key/value pairs and a unique
     * request ID to send to the Tenant Security Proxy.
     * @param tenantId                  Unique ID of tenant that is performing the operation.
     * @param requestingUserOrServiceId Unique ID of user/service that is processing data.
     * @param dataLabel                 Classification of data being processed.
     * @param sourceIp                  IP address of the initiator of this document request.
     * @param objectId                  ID of the object/document being acted on in the host system.
     * @param requestId                 Unique ID that ties host application request ID to Tenant
     *                                  Security Proxy logs.
     * @param otherData                 Additional String key/value pairs to add to metadata.
     * @throws                          If any of the required fields aren't set.
     */
    constructor(
        tenantId: string,
        requestingUserOrServiceId: string,
        dataLabel: string,
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
        if (!dataLabel) {
            throw new Error("Must provide a valid dataLabel for all CMK operations.");
        }
        this.tenantId = tenantId;
        this.requestingUserOrServiceId = requestingUserOrServiceId;
        this.dataLabel = dataLabel;
        this.sourceIp = sourceIp;
        this.objectId = objectId;
        this.requestId = requestId;
        this.otherData = otherData;
    }

    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types*/
    toJsonStructure = () =>
        clearUndefinedProperties({
            tenantId: this.tenantId,
            requestingId: this.requestingUserOrServiceId,
            dataLabel: this.dataLabel,
            requestId: this.requestId,
            sourceIp: this.sourceIp,
            objectId: this.objectId,
            customFields: this.otherData,
        });
}
