import {SecurityEvent} from "./SecurityEvent";

const validNameExp = /[A-Z_]+/;
export class CustomSecurityEvent extends SecurityEvent {
    constructor(name: string) {
        if (!validNameExp.test(name) || name.length === 0 || name.startsWith("_")) {
            throw new Error("Custom event must be SCREAMING_SNAKE_CASE, not empty, and start with a letter.");
        }
        super(name);
    }

    getFlatEvent(): string {
        return `CUSTOM_${this.name}`;
    }
}
