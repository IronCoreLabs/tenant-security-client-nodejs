import {KmsException} from "./kms/KmsException";
import {SecurityEventException} from "./logdriver/SecurityEventException";
import {TenantSecurityErrorCode, TenantSecurityException} from "./TenantSecurityException";
import {TscException} from "./TscException";
import {TspServiceException} from "./TspServiceException";

export class TenantSecurityExceptionUtils {
    /**
     * Should be used most of the time to construct a TenantSecurityException and avoid runtime errors about unrecognized codes.
     */
    static from(code: number, message: string, httpStatus?: number): TenantSecurityException {
        if (code >= 0 && TenantSecurityErrorCode[code] != null) {
            if (code === 0) {
                return new TspServiceException(TenantSecurityErrorCode.UNABLE_TO_MAKE_REQUEST, message, httpStatus);
            } else if (code >= 100 && code < 199) {
                return new TspServiceException(code, message, httpStatus);
            } else if (code >= 200 && code < 299) {
                return new KmsException(code, message, httpStatus);
            } else if (code >= 300 && code < 399) {
                return new SecurityEventException(code, message, httpStatus);
            } else if (code >= 900 && code < 999) {
                return new TscException(code, message);
            } else {
                return new TspServiceException(TenantSecurityErrorCode.UNKNOWN_ERROR, message, httpStatus);
            }
        } else {
            return new TspServiceException(TenantSecurityErrorCode.UNKNOWN_ERROR, "TSP status code outside of recognized range", httpStatus);
        }
    }
}
