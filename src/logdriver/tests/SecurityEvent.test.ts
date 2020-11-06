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
        expect(DataEvent.ACCESS_DENIED.getFlatEvent()).toBe("DATA_ACCESS_DENIED");
        expect(DataEvent.CHANGE_PERMISSIONS.getFlatEvent()).toBe("DATA_CHANGE_PERMISSIONS");

        // PERIODIC
        expect(PeriodicEvent.RETENTION_POLICY_ENFORCED.getFlatEvent()).toBe("PERIODIC_RETENTION_POLICY_ENFORCED");
        expect(PeriodicEvent.BACKUP_CREATED.getFlatEvent()).toBe("PERIODIC_BACKUP_CREATED");

        // USER
        expect(UserEvent.ADD.getFlatEvent()).toBe("USER_ADD");
        expect(UserEvent.SUSPEND.getFlatEvent()).toBe("USER_SUSPEND");
        expect(UserEvent.REMOVE.getFlatEvent()).toBe("USER_REMOVE");
        expect(UserEvent.LOGIN.getFlatEvent()).toBe("USER_LOGIN");
        expect(UserEvent.SESSION_TIMEOUT.getFlatEvent()).toBe("USER_SESSION_TIMEOUT");
        expect(UserEvent.LOCKOUT.getFlatEvent()).toBe("USER_LOCKOUT");
        expect(UserEvent.LOGOUT.getFlatEvent()).toBe("USER_LOGOUT");
        expect(UserEvent.PERMISSIONS_CHANGE.getFlatEvent()).toBe("USER_PERMISSIONS_CHANGE");
        expect(UserEvent.PASSWORD_EXPIRED.getFlatEvent()).toBe("USER_PASSWORD_EXPIRED");
        expect(UserEvent.PASSWORD_RESET.getFlatEvent()).toBe("USER_PASSWORD_RESET");
        expect(UserEvent.PASSWORD_CHANGE.getFlatEvent()).toBe("USER_PASSWORD_CHANGE");
        expect(UserEvent.BAD_LOGIN.getFlatEvent()).toBe("USER_BAD_LOGIN");
        expect(UserEvent.ENABLE_TWO_FACTOR.getFlatEvent()).toBe("USER_ENABLE_TWO_FACTOR");
        expect(UserEvent.DISABLE_TWO_FACTOR.getFlatEvent()).toBe("USER_DISABLE_TWO_FACTOR");
        expect(UserEvent.EMAIL_CHANGE.getFlatEvent()).toBe("USER_EMAIL_CHANGE");
        expect(UserEvent.EMAIL_VERIFICATION_REQUESTED.getFlatEvent()).toBe("USER_EMAIL_VERIFICATION_REQUESTED");
        expect(UserEvent.EMAIL_VERIFIED.getFlatEvent()).toBe("USER_EMAIL_VERIFIED");
    });
});
