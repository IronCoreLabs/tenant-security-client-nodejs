export default class RequestMetadata {
    private tenantId: string;
    private requestingUserOrServiceId: string;
    private dataLabel: string;
    private requestId?: string;
    private otherData?: Record<string, string>;

    constructor(tenantId: string, requestingUserOrServiceId: string, dataLabel: string, requestId?: string, otherData?: Record<string, string>) {
        if (!tenantId) {
            throw new Error("Must provide a valid tenantID for all CMK operations.");
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
        this.requestId = requestId;
        this.otherData = otherData;
    }

    toJsonStructure = () => ({
        tenantID: this.tenantId,
        requestingID: this.requestingUserOrServiceId,
        dataLabel: this.dataLabel,
        requestID: this.requestId,
        customFields: this.otherData,
    });
}
