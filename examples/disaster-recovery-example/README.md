# Disaster Recovery Example
This provides an example of the code and knowledge required to recover documents encrypted using SaaS Shield
in the event that the TSC is unable to decrypt them. There are some almost impossible situations that would
be required for this to occur:

- IronCore's Configuration Broker is unavailable for a long period of time, and all of your TSPs have
restarted and are unable to retrieve their configuration
- All your TSPs have failed and you can't get them restarted in your infrastructure
- You lost access to the TSC package that you use in your application

Even in the event that you are removing your usage of IronCore, you would still be able to migrate documents
from the system without resorting to a recovery effort. But robust Disaster Recovery and Business Continuity
plans require you to prepare for impossible situations, so we offer this as a starting point to show how you
can develop a plan. We also offer this as assistance for those who are contemplating "IronCore and all
their services were hit by a meteor storm" or "I'm an archeologist trying to recover lost encrypted data"
situations. 'Cause archeologists need love too!

This example uses previously encrypted data from the other examples. When run, it deconstructs that data and reconstitutes the original decrypted data.

The credentials to run this yourself aren't provided, but you can see the code and example output for more information about what is happening.

Information on IronCore document header shapes and protobuf formats can be found in the open-source [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) repository. 

## Recovery Process

### Retrieving the Encrypted Bytes, GCM tag, and IV
In the `EncryptedDocumentMap` (`Map<String, byte[]>`) returned by the TSC, the `byte[]`s in v3 documents are of the structure:

```
VERSION_NUMBER (1 byte, fixed at 3)
IRONCORE_MAGIC (4 bytes, IRON in ASCII)
HEADER_LENGTH (2 bytes Uint16)
PROTOBUF_HEADER_DATA (variable bytes based on prior field)
DATA IV (12 bytes)
ENCRYPTED_DATA (remaining_length - 16 bytes)
GCM_TAG (16 bytes)
```

`ENCRYPTED_DATA` are the bytes you’ll be decrypting, and the `DATA_IV` is needed to make the AES decryption call. You’ll also need the encryption key, obtained in the next step.

See [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) combined with the open-source code of the specific version of the TSC or IronCore Alloy that you're using to know what the document header structure of your data will be.

### Retrieving the Document Encryption Key
The DEK (Document Encryption Key) you need to decrypt the `ENCRYPTED_DATA` is the decrypted value of the EDEK (Encrypted DEK) that was also returned by the TSC.

The process to decrypt this differs based on whether a leased key was used or not.
The EDEK, provided by the TSC as a base64 string, is actually a protobuf message with the structure:

```protobuf
message EncryptedDek {
  bytes encryptedDekData = 1;
  int32 kmsConfigId = 2;
  int32 leasedKeyId = 3;
  bytes leasedKeyIv = 4;
  EncryptedDeks encryptedLeasedKeyData = 5;
}

message EncryptedDeks {repeated EncryptedDek encryptedDeks = 1;}
```

You need to decode the EDEK base64 as an `EncryptedDeks` message, then for disaster recovery you're safe to just use the first `EncryptedDek` in the resulting list of them. 

See [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) combined with the open-source code of the specific version of the TSC or IronCore Alloy that you're using for the most up to date information on what protobuf formats to expect.


#### Un-leased
If the `EncryptedDek.leasedKeyId` is `0` (zero) you can decrypt the DEK by calling unwrap on your (or the tenant’s) KMS, passing the `EncryptedDek.encryptedDekData` bytes, using the correct credentials and key path. The result will be the DEK which can then be used in the “Decrypting the Document” step. 

#### Leased
If the `EncryptedDek.leasedKeyId` is nonzero you need to unwrap the leased key before using it to decrypt the EDEK. The leased key itself is also an EDEK, so first retrieve `EncryptedDek.encryptedLeasedKeyData.encryptedDeks[0].encryptedDekData`. Then call unwrap on your (or the tenant’s) KMS, passing the those bytes, using the correct credentials and key. The response is the `DECRYPTED_LEASED_KEY`.

Use the `DECRYPTED_LEASED_KEY`, and the `EncryptedDek.leasedKeyIv` to AES decrypt the `EncryptedDek.encryptedDekData`. The result will be the DEK which can then be used in the “Decrypting the Document” step.

### Decrypting the Document
Once you have the `DEK`, `ENCRYPTED_DATA`, and `DATA_IV` you can make an AES-256 GCM decrypt call with all three of those parameters. The result will be the original bytes that were sent into the TSC for encryption.

### Gotchas
This is only possible if you have or can have access to the KMS credentials and key used by the involved
tenant (whether the KMS configuration was provided by the vendor or by the tenant). Normally, IronCore tracks
the KMS configuration used to encrypt a piece of data in the `kmsConfigId` EDEK header, but without the
Configuration Broker, it will be difficult to map from this ID to the actual KMS settings that were used.
If the tenant in question only ever had one KMS configuration, you can just use that combination of creds and
keypath. However, if there were multiple configurations used over time, you'll have to use trial and error on
all known keypaths / creds and map out the associations.


## Example Run Output

Code for this process is in `src/index.ts`. It can be run with `yarn && yarn start` if you have IronCore GCP credentials. This same code could be modified or expanded on to work for your real data or recovery process, but it is not itself production quality code.

```console
Unleased Encrypted Document: {
  "ssn": "\u0003IRON\u0000,\n\u001c������\"_���k,�\bj@���S\u001f�b3g�M\u001a\f\n\ntenant-gcp\u001a \u0002 Zک�\u0001��q*�\n\u000eq�/\u0004\u00122(��؋@ʹ�F\u0007K\u0005���",
  "address": "\u0003IRON\u0000,\n\u001c��K����Y�Ѯ'����\u0003!<\u001a\u001e�\u0003(\u001a\f\n\ntenant-gcp�i����ā\u0006@�5�E��ϝ���Y4/P���.V�\u0017�|\f�M����\t7�xƵ�\u001f�&��Գ}��\f\u0004��u��|",
  "name": "\u0003IRON\u0000,\n\u001c��\u0013ر4������\u001f��@\u0013_%��\u001f:��&\u001a\f\n\ntenant-gcpe�Ҫ�`%H&*��\u001c`�\u0015�Bg��\u0018��V>��\u001a�>\u0002\u000b\u0015\n�f"
}
Unleased Document: {
  "ssn": "000-12-2345",
  "address": "2825-519 Stone Creek Rd, Bozeman, MT 59715",
  "name": "Jim Bridger"
}
Leased Encrypted Document: {
  "ssn": "\u0003IRON\u0000.\n\u001cA^x�\u000eu��3MU���O�bA�]˺\u0016�/}�\u001a\u000e\n\ftenant-gcp-l\u001f��Ⱥ��\t��M� t�%T�ei���\u0011Ҳ~\u001dH\u0013�7p�'��W",
  "address": "\u0003IRON\u0000.\n\u001c��-�:D�(\u0012�Z\u0011\r퓽�;�\u0015 h�~\u001d\u001a\u000e\n\ftenant-gcp-l}&]\u0002\u0005Ш\u0013uS�ݝ3$� I\\���_�\u001a��Tb�\u0002�ހP�\u0010�.�\u001cϸ�6^&�Nӂ�\t/ݫ䕇!.�4\u0010Q/\t�\u0002",
  "name": "\u0003IRON\u0000.\n\u001c_�|dF�\u0001���\"�\u000ef2(�[G�\u0015�G��\n\u0018�\u001a\u000e\n\ftenant-gcp-l�i�\u001c8�Dl�Z\tA\b\u001f���[Q�)����a�\nאw�m[�f«"
}
Leased Document: {
  "ssn": "000-12-2345",
  "address": "2825-519 Stone Creek Rd, Bozeman, MT 59715",
  "name": "Jim Bridger"
}
```

## Deterministic

As mentioned in the [documentation on our website](https://ironcorelabs.com/docs/saas-shield/deterministic-encryption/#recovering-data) the recovery process for deterministically encrypted data requires a few extra steps. Deterministic data is encrypted with a key derived from a rotating tenant secret, which itself is wrapped by their KMS. To recover deterministic data, we need to:

1. Determine the ID of the secret used for our data.
2. Retrieve that previously backed-up encrypted secret.
3. Decrypt the secret (using the method described in [Recovery Process](#recovery-process)).
4. Use the secret to hash a string incorporating the derivation path and tenant ID.
5. Use that string as a key to decrypt the data. 

Let's go over those steps in more detail. A concrete Typescript example of this process can be found in `examples/disaster-recovery-example/src/deterministic.ts`.

### Determine Secret ID

We need to retrieve the ID of the secret that was used to encrypt our piece of data so the encrypted secret can be retrieved from backups.

For deterministic data encrypted with the Tenant Security Clients (`tsc-java 6+`, `tsc-nodejs 3+`, not supported in `tsc-php` or `tsc-go`), the first 4 binary bytes contain the tenant secret ID, and the next two bytes are padding.

For deterministic data encrypted with IronCore Alloy, the first 4 binary bytes contain the tenant secret ID. See the [ironcore-alloy](https://github.com/IronCoreLabs/ironcore-alloy/blob/main/src/deterministic.rs) and [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) source code for the most up-to-date information.

### Retrieve Secret

Encrypted tenant secrets are available from the Configuration Broker and should be regularly backed up.

In the UI a `.zip` of encrypted tenant secrets can be downloaded from the [Tenant Secrets page](https://config.staging.ironcorelabs.com/app/kms/secrets) of the Configuration Broker. Look for a clickable download icon near the page title.

In the Vendor API Bridge, a request to the [List Tenant Secrets](https://ironcore-labs.stoplight.io/docs/vendor-bridge/8ee4d2ba0dd9c-list-tenant-secrets) endpoint will return a `JSON` list of encrypted tenant secrets.

These encrypted secrets need to be backed up in a way that they can be reliably retrieved by secret ID in a disaster scenario.

### Decrypt Secret

The secret is encrypted by the tenant's KMS, and the process described in [Recovery Process](#recovery-process) is used to decrypt it. Notably, the secret will include a KMS config ID in its header (see [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) for header formats), but without access to the Configuration Broker it won't be clear which of the tenants KMS key paths and credentials were referenced by that KMS config. In a true disaster scenario, you'll need to work with the tenant to either provide them with these secrets and have them try decryption with all their KMS keys, or have them provide you or your recovery tool with credentials that can access all their possible KMS keys to try.

### Create a Deterministic Key

Once you have the tenant's decrypted secret for this piece of data, you can create a deterministic key. Use the secret as a key to `HMAC-SHA512` sign over `"tenant_provided_id-derivation_path"`. The output of the hash is the deterministic key used to decrypt the actual data.

### Decrypt the Data

Use the deterministic key to `AES-SIV` decrypt the deterministic data. There is no `AES-SIV` associated data on IronCore deterministic values.

### Example Run Output

Code for this process is in `src/deterministic.ts`. It can be run with `yarn && yarn deterministic` if you have IronCore GCP credentials. This same code could be modified or expanded on to work for your real data or recovery process, but it is not itself production quality code.

```console
Deterministic Encrypted Value:
          AAAT9wAAeFKwSikcVVSXpGj8z2/7bYkDpEue9kUlUxOj
Recovered Secret ID:
          5111
Retrieved Backup Secret: {
	"tenantProvidedId": "tenant-gcp",
	"numericId": 5111,
	"id": "4a7f76dd-a0fb-4642-b15b-8423a983cc88",
	"tenantSecretId": 5111,
	"secretFingerprint": "tMoo5p0wpn3J2AS3iJptVWAS19B9zvj1nDGltf40wos=",
	"secretPath": "secretPath",
	"kmsConfigId": 510,
	"migrationStatus": 1,
	"encryptedSecret": "CnYKcQokAAWBd/OMpxQKZ7Fzm7WnD1vprk6t5a2Cx1OS5ZaTd3Qez6Q9EkkA8xjtHtVE4ZD8CMqa1bWVwiTggI/McQvx7+bvuytA9ztnivj08xOIIJy2zV9aU2w9RykpEXPk7pXZCLT3vMtt+5dho9m8igg6EP4D",
	"rotationStatus": 1,
	"secretType": 2,
	"created": 1689877493455,
	"updated": 1689877493455
}
Decrypting Backup Secret with Tenant's GCP KMS using provided credentials...
Decrypted Backup Secret:
          ScbKs2h0XSaBQ/vXp04RmChAffLjh2nxBgRT95j21FM=
Hashing Over Tenant String:
          tenant-gcp-derivPath
Recovered Deterministic Key:
          +5RA+h4hWWs28cDBaJ0xf6VekSt+NyqJLnj9/GLugMBgwPhV/Qcefs21asNN+iN3h1H8MSjRlgA+V7CyPfmFYw==
AES-SIV Decrypting Deterministic Data...
Recovered Data:
          SmltIEJyaWRnZXI=
Original Data (String):
          Jim Bridger
```
