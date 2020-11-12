import {SecurityEvent} from "./SecurityEvent";

export class UserEvent extends SecurityEvent {
    private constructor(name: string) {
        super(name);
    }

    static readonly ADD = new UserEvent("ADD");
    static readonly SUSPEND = new UserEvent("SUSPEND");
    static readonly REMOVE = new UserEvent("REMOVE");
    static readonly LOGIN = new UserEvent("LOGIN");
    static readonly TIMEOUT_SESSION = new UserEvent("TIMEOUT_SESSION");
    static readonly LOCKOUT = new UserEvent("LOCKOUT");
    static readonly LOGOUT = new UserEvent("LOGOUT");
    static readonly CHANGE_PERMISSIONS = new UserEvent("CHANGE_PERMISSIONS");
    static readonly EXPIRE_PASSWORD = new UserEvent("EXPIRE_PASSWORD");
    static readonly RESET_PASSWORD = new UserEvent("RESET_PASSWORD");
    static readonly CHANGE_PASSWORD = new UserEvent("CHANGE_PASSWORD");
    static readonly REJECT_LOGIN = new UserEvent("REJECT_LOGIN");
    static readonly ENABLE_TWO_FACTOR = new UserEvent("ENABLE_TWO_FACTOR");
    static readonly DISABLE_TWO_FACTOR = new UserEvent("DISABLE_TWO_FACTOR");
    static readonly CHANGE_EMAIL = new UserEvent("CHANGE_EMAIL");
    static readonly REQUEST_EMAIL_VERIFICATION = new UserEvent("REQUEST_EMAIL_VERIFICATION");
    static readonly VERIFY_EMAIL = new UserEvent("VERIFY_EMAIL");

    getFlatEvent(): string {
        return `USER_${this.name}`;
    }
}
