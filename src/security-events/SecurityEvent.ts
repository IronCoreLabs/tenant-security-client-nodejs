export abstract class SecurityEvent {
    constructor(public readonly name: string) {}
    abstract getFlatEvent(): string;
}

export {AdminEvent} from "./AdminEvent";
export {CustomSecurityEvent} from "./CustomEvent";
export {DataEvent} from "./DataEvent";
export {PeriodicEvent} from "./PeriodicEvent";
export {SecurityEventException} from "./SecurityEventException";
export {UserEvent} from "./UserEvent";
