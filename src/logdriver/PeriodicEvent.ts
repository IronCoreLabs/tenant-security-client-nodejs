import {SecurityEvent} from "./SecurityEvent";

export class PeriodicEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly ENFORCE_RETENTION_POLICY = new PeriodicEvent("ENFORCE_RETENTION_POLICY");
    static readonly CREATE_BACKUP = new PeriodicEvent("CREATE_BACKUP");

    getFlatEvent(): string {
        return `PERIODIC_${this.name}`;
    }
}
