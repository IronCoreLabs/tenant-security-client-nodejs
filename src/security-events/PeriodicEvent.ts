import {SecurityEvent} from "./SecurityEvent";

export class PeriodicEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly RETENTION_POLICY_ENFORCED = new PeriodicEvent("RETENTION_POLICY_ENFORCED");
    static readonly BACKUP_CREATED = new PeriodicEvent("BACKUP_CREATED");

    getFlatEvent(): string {
        return `PERIODIC_${this.name}`;
    }
}
