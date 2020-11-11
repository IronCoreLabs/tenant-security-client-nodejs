import {SecurityEvent} from "./SecurityEvent";

export class UserEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly ADD = new UserEvent("ADD");
    static readonly SUSPEND = new UserEvent("SUSPEND");
    static readonly REMOVE = new UserEvent("REMOVE");
    static readonly LOGIN = new UserEvent("LOGIN");
    static readonly SESSION_TIMEOUT = new UserEvent("SESSION_TIMEOUT");
    static readonly LOCKOUT = new UserEvent("LOCKOUT");
    static readonly LOGOUT = new UserEvent("LOGOUT");
    static readonly CHANGE_PERMISSIONS = new UserEvent("CHANGE_PERMISSIONS");
    static readonly PASSWORD_EXPIRED = new UserEvent("PASSWORD_EXPIRED");
    static readonly PASSWORD_RESET = new UserEvent("PASSWORD_RESET");
    static readonly PASSWORD_CHANGE = new UserEvent("PASSWORD_CHANGE");
    static readonly BAD_LOGIN = new UserEvent("BAD_LOGIN");
    static readonly ENABLE_TWO_FACTOR = new UserEvent("ENABLE_TWO_FACTOR");
    static readonly DISABLE_TWO_FACTOR = new UserEvent("DISABLE_TWO_FACTOR");
    static readonly EMAIL_CHANGE = new UserEvent("EMAIL_CHANGE");
    static readonly EMAIL_VERIFICATION_REQUESTED = new UserEvent("EMAIL_VERIFICATION_REQUESTED");
    static readonly EMAIL_VERIFIED = new UserEvent("EMAIL_VERIFIED");

    getFlatEvent(): string {
        return `USER_${this.name}`;
    }
}
