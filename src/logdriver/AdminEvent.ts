import {SecurityEvent} from "./SecurityEvent";

export class AdminEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly ADD = new AdminEvent("ADD");
    static readonly REMOVE = new AdminEvent("REMOVE");
    static readonly CHANGE_PERMISSIONS = new AdminEvent("CHANGE_PERMISSIONS");
    static readonly CHANGE_SETTING = new AdminEvent("CHANGE_SETTING");

    getFlatEvent(): string {
        return `ADMIN_${this.name}`;
    }
}
