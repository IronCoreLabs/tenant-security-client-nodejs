import {SecurityEvent} from "./SecurityEvent";

export class DataEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly IMPORT = new DataEvent("IMPORT");
    static readonly EXPORT = new DataEvent("EXPORT");
    static readonly ENCRYPT = new DataEvent("ENCRYPT");
    static readonly DECRYPT = new DataEvent("DECRYPT");
    static readonly CREATE = new DataEvent("CREATE");
    static readonly DELETE = new DataEvent("DELETE");
    static readonly ACCESS_DENIED = new DataEvent("ACCESS_DENIED");
    static readonly CHANGE_PERMISSIONS = new DataEvent("CHANGE_PERMISSIONS");

    getFlatEvent(): string {
        return `DATA_${this.name}`;
    }
}
