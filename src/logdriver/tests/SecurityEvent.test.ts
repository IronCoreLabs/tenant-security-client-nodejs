import {AdminEvent} from "../AdminEvent";
import {DataEvent} from "../DataEvent";
import {PeriodicEvent} from "../PeriodicEvent";
import {UserEvent} from "../UserEvent";

describe("UNIT SecurityEvent", () => {
    test("getFlatEvent stability test.", () => {
        expect(AdminEvent.ADD.getFlatEvent()).toBe("ADMIN_ADD");
        expect(AdminEvent.REMOVE.getFlatEvent()).toBe("ADMIN_REMOVE");
        expect(AdminEvent.CHANGE_PERMISSIONS.getFlatEvent()).toBe("ADMIN_CHANGE_PERMISSIONS");
        expect(AdminEvent.CHANGE_SETTING.getFlatEvent()).toBe("ADMIN_CHANGE_SETTING");

        // DATA
        expect(DataEvent.IMPORT.getFlatEvent()).toBe("DATA_IMPORT");
        expect(DataEvent.EXPORT.getFlatEvent()).toBe("DATA_EXPORT");
        expect(DataEvent.ENCRYPT.getFlatEvent()).toBe("DATA_ENCRYPT");
        expect(DataEvent.DECRYPT.getFlatEvent()).toBe("DATA_DECRYPT");
        expect(DataEvent.CREATE.getFlatEvent()).toBe("DATA_CREATE");
        expect(DataEvent.DELETE.getFlatEvent()).toBe("DATA_DELETE");
        expect(DataEvent.DENY_ACCESS.getFlatEvent()).toBe("DATA_DENY_ACCESS");
        expect(DataEvent.CHANGE_PERMISSIONS.getFlatEvent()).toBe("DATA_CHANGE_PERMISSIONS");

        // PERIODIC
        expect(PeriodicEvent.ENFORCE_RETENTION_POLICY.getFlatEvent()).toBe("PERIODIC_ENFORCE_RETENTION_POLICY");
        expect(PeriodicEvent.CREATE_BACKUP.getFlatEvent()).toBe("PERIODIC_CREATE_BACKUP");

        // USER
        expect(UserEvent.ADD.getFlatEvent()).toBe("USER_ADD");
        expect(UserEvent.SUSPEND.getFlatEvent()).toBe("USER_SUSPEND");
        expect(UserEvent.REMOVE.getFlatEvent()).toBe("USER_REMOVE");
        expect(UserEvent.LOGIN.getFlatEvent()).toBe("USER_LOGIN");
        expect(UserEvent.TIMEOUT_SESSION.getFlatEvent()).toBe("USER_TIMEOUT_SESSION");
        expect(UserEvent.LOCKOUT.getFlatEvent()).toBe("USER_LOCKOUT");
        expect(UserEvent.LOGOUT.getFlatEvent()).toBe("USER_LOGOUT");
        expect(UserEvent.CHANGE_PERMISSIONS.getFlatEvent()).toBe("USER_CHANGE_PERMISSIONS");
        expect(UserEvent.EXPIRE_PASSWORD.getFlatEvent()).toBe("USER_EXPIRE_PASSWORD");
        expect(UserEvent.RESET_PASSWORD.getFlatEvent()).toBe("USER_RESET_PASSWORD");
        expect(UserEvent.CHANGE_PASSWORD.getFlatEvent()).toBe("USER_CHANGE_PASSWORD");
        expect(UserEvent.REJECT_LOGIN.getFlatEvent()).toBe("USER_REJECT_LOGIN");
        expect(UserEvent.ENABLE_TWO_FACTOR.getFlatEvent()).toBe("USER_ENABLE_TWO_FACTOR");
        expect(UserEvent.DISABLE_TWO_FACTOR.getFlatEvent()).toBe("USER_DISABLE_TWO_FACTOR");
        expect(UserEvent.CHANGE_EMAIL.getFlatEvent()).toBe("USER_CHANGE_EMAIL");
        expect(UserEvent.REQUEST_EMAIL_VERIFICATION.getFlatEvent()).toBe("USER_REQUEST_EMAIL_VERIFICATION");
        expect(UserEvent.VERIFY_EMAIL.getFlatEvent()).toBe("USER_VERIFY_EMAIL");
    });
});
