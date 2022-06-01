## 2.3.0

-   Added `KmsException` for KmsThrottled. Need TSP 4.4.1+ to make use of this.

## 2.2.1

-   Added `TenantSecurityClient.rekeyEdek` method
-   Deprecate `TenantSecurityClient.rekeyDocument` method

## 2.1.0

-   Added `TenantSecurityClient.rekeyDocument` method and support `RekeyResponse` type

## 2.0.3

-   Fix EventMetadata default timestamp

## 2.0.2

-   Renamed some events for consistency, pulled 2.0.1

## 2.0.1

-   Fixed type definitions for 2.0.0, pulled 2.0.0

## 2.0.0

-   Added `TenantSecurityClient.logSecurityEvent` method and supporting `SecurityEvent` and `EventMetadata` types
-   Standardized `EventMetadata` and `DocumentMetadata` to similar interfaces with the TSP
-   Introduced an exception hierarchy based on TSP error codes. `TenantSecurityKMSException` renamed to `TenantSecurityException` and
    `KmsException`, `SecurityEventException`, and `TspServiceException` are subclasses.
-   Renamed `TenantSecurityKMSClient` to `TenantSecurityClient`

### Compatibility

This version of the Tenant Security NodeJS Client will only work with version `3.0.0+` of the Tenant Security Proxy container.

## 1.0.3

-   fix mistake publishing
-   update dependencies

## 1.0.2

-   include the protobuf in the distribution
-   fix exports
-   update doc site links

## 1.0.0

Initial open source release

### Compatibility

This version of the Tenant Security NodeJS Client will only work with version `>= 2.0.0 < 4.0.0` of the Tenant Security Proxy container due to a deprecated interface. `TSP v3` supports both the old and new interfaces and can be used to migrate TSCs if necessary.
