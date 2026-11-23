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

Our [data continuity planning](https://ironcorelabs.com/docs/saas-shield/data-continuity/) documentation covers what to back up ahead of time so that a recovery like this is possible.

This example uses previously encrypted data from the other examples. When run, it deconstructs that data and reconstitutes the original decrypted data.

The credentials to run this yourself aren't provided, but you can see the code and example output for more information about what is happening.

Information on IronCore document header shapes and protobuf formats can be found in the open-source [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) repository.

## Recovery Process

To decrypt a document you need:

1. The encrypted document as `encryptDocument` returned it: an `encryptedDocument` object mapping each field name to an encrypted `Buffer`, and the `edek` (a base64 string) that all of its fields share.
2. Access to the KMS key that protected the document's key, through your own credentials or the tenant's (see [Gotchas](#gotchas) for working out which key).
3. An AES-256-GCM implementation, which every mainstream crypto library has.

Each field is decrypted on its own, with the same document encryption key (DEK).

### Retrieving the Encrypted Bytes, IV, and GCM Tag
Each encrypted field is a v3 IronCore document with the structure:

```
VERSION_NUMBER (1 byte, fixed at 3)
IRONCORE_MAGIC (4 bytes, IRON in ASCII)
HEADER_LENGTH (2 bytes, big-endian Uint16)
PROTOBUF_HEADER_DATA (HEADER_LENGTH bytes)
DATA_IV (12 bytes)
ENCRYPTED_DATA (everything after DATA_IV except the last 16 bytes)
GCM_TAG (16 bytes)
```

`ENCRYPTED_DATA` is what you'll decrypt, and you'll need `DATA_IV` and `GCM_TAG` to do it, along with the DEK from the next step. Some libraries take the GCM tag separately (Node's `decipher.setAuthTag`), while others expect it on the end of the encrypted data, in which case pass everything after `DATA_IV`.

You don't need `PROTOBUF_HEADER_DATA` to decrypt, but it's useful in a recovery. It's a `v3DocumentHeader`, and for SaaS Shield documents it carries the ID of the tenant the document was encrypted for, in plaintext:

```protobuf
message v3DocumentHeader {
  bytes sig = 1;
  oneof header {
    DataControlPlatformHeader data_control = 2;
    SaaSShieldHeader saas_shield = 3;
  }
}

message SaaSShieldHeader {
  string tenant_id = 1;
}
```

`sig` is the IV and GCM tag from encrypting the `SaaSShieldHeader` bytes with the DEK, so it can confirm you have the right DEK. Decrypting with the wrong DEK fails anyway, so checking it is optional.

See [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) combined with the open-source code of the specific version of the TSC or IronCore Alloy that you're using to know what the document header structure of your data will be.

### Retrieving the Document Encryption Key
The DEK you need to decrypt `ENCRYPTED_DATA` is the decrypted value of the EDEK (Encrypted DEK) that was also returned by the TSC. The EDEK, a base64 string, is a protobuf message with the structure:

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

Decode the EDEK base64 as an `EncryptedDeks` message. For disaster recovery you're safe to just use the first `EncryptedDek` in the resulting list. Its `kmsConfigId` is the ID of the KMS configuration that protected the DEK, and `leasedKeyId` says whether a leased key was involved.

See [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) combined with the open-source code of the specific version of the TSC or IronCore Alloy that you're using for the most up to date information on what protobuf formats to expect.

#### Un-leased
If the `EncryptedDek.leasedKeyId` is `0` (zero), decrypt the `EncryptedDek.encryptedDekData` bytes with the KMS key, as described in [Calling Your KMS](#calling-your-kms). The result is the DEK, which can then be used in the [Decrypting the Document](#decrypting-the-document) step.

#### Leased
If the `EncryptedDek.leasedKeyId` is nonzero, the DEK was encrypted with a leased key, and the leased key was encrypted with the KMS key:

1. Decrypt `EncryptedDek.encryptedLeasedKeyData.encryptedDeks[0].encryptedDekData` with the KMS key, as described in [Calling Your KMS](#calling-your-kms). The result is the 32-byte `DECRYPTED_LEASED_KEY`.
2. AES-256-GCM decrypt `EncryptedDek.encryptedDekData` using the `DECRYPTED_LEASED_KEY` and the 12-byte `EncryptedDek.leasedKeyIv`. The last 16 bytes of `encryptedDekData` are the GCM tag, and there's no associated data. The result is the DEK, which can then be used in the [Decrypting the Document](#decrypting-the-document) step.

#### Calling Your KMS
What the bytes you send to the KMS contain, and the call to make with them, depends on the configuration's KMS:

| KMS                | The bytes                                    | The call                                                                                                                                                                                                                                                           |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AWS KMS            | The KMS ciphertext                           | `Decrypt` with the bytes as `CiphertextBlob`, in the key's region. The ciphertext identifies the key, so you don't need to pass its ID.                                                                                                                            |
| Google Cloud KMS   | The KMS ciphertext                           | `decrypt` on the key's full resource name (`projects/.../locations/.../keyRings/.../cryptoKeys/...`), with no additional authenticated data.                                                                                                                       |
| Azure Key Vault    | An `AzureKeyVersionAndData` protobuf (below) | `unwrapKey` on the key at the protobuf's `keyVersion`, with algorithm `RSA-OAEP-256` and the protobuf's `encryptedDekData` as the value.                                                                                                                           |
| Thales CipherTrust | A `ThalesMetaAndData` protobuf (below)       | `POST /api/v1/crypto/decrypt` with the key's ID as `id`, and the protobuf's `encryptedDekData`, `encryptionIv`, `encryptionTag` (all base64-encoded), `encryptionMode`, `keyVersion`, and `keyIdType` as `ciphertext`, `iv`, `tag`, `mode`, `version`, and `type`. |

Azure EDEKs from older TSPs hold the KMS ciphertext itself rather than an `AzureKeyVersionAndData`. If the bytes don't decode as that protobuf, or its `encryptedDekData` is empty, pass them as they are to `unwrapKey` on the key's latest version.

```protobuf
message AzureKeyVersionAndData {
  bytes encryptedDekData = 1;
  string keyVersion = 2;
}

message ThalesMetaAndData {
  bytes encryptedDekData = 1;
  bytes encryptionIv = 2;
  bytes encryptionTag = 3;
  string encryptionMode = 4;
  int32 keyVersion = 5;
  string keyIdType = 6;
}
```

#### IAM Role Configurations
An AWS KMS configuration can use an IAM role instead of an access key, in which case there are no credentials to unwrap with. Instead, make the unwrap call with any AWS identity that the key's policy allows to decrypt. For your own configurations you control the key's policy, but for a tenant's configuration you'll need to work with the tenant. They can either try decryption with their own AWS identities, or give you the role ARN, the key's ID and region, and the external ID from the role's trust policy. With those, your recovery tool can run as the role your TSPs use, assume the tenant's role with the external ID, and make the unwrap call with the temporary credentials, just as a TSP would.

### Decrypting the Document
Once you have the DEK, `DATA_IV`, `ENCRYPTED_DATA`, and `GCM_TAG`, make an AES-256-GCM decrypt call with them. There's no associated data. The result is the original bytes that were sent into the TSC for encryption.

### Gotchas
This is only possible if you have, or can get, access to the KMS key used by the involved tenant, whether the KMS configuration was provided by the vendor or by the tenant. For most configurations that means the key's credentials. For a configuration that uses an IAM role, it means an AWS identity that the key's policy allows to decrypt.

Normally, IronCore tracks the KMS configuration used to encrypt a piece of data in the EDEK's `kmsConfigId`, but without the Configuration Broker, it will be difficult to map from this ID to the actual KMS settings that were used. The tenant ID in the document header narrows it down to one tenant's configurations. If the tenant in question only ever had one KMS configuration, you can just use that combination of creds and key path. However, if there were multiple configurations used over time, you'll have to use trial and error on all known key paths / creds and map out the associations. AWS KMS is the exception. Its ciphertext identifies the key, so any identity that the key's policy allows can decrypt without knowing the key path, as long as it calls KMS in the key's region.

To avoid this for your own configurations, keep a record of each configuration's KMS config ID, key path, and role ARN (if it uses an IAM role) while the Configuration Broker is available. The Vendor Bridge returns them when you get one of your configurations.

## Example Run Output

Code for this process is in `src/index.ts`. It can be run with `yarn && yarn start` if you have IronCore GCP credentials and `protoc` on your path (the script regenerates `src/transform.ts` from `transform.proto`). This same code could be modified or expanded on to work for your real data or recovery process, but it is not itself production quality code.

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
4. Use the secret to hash a string made of the tenant ID and derivation path.
5. Use the hash as a key to decrypt the data.

Let's go over those steps in more detail. A concrete Typescript example of this process can be found in `examples/disaster-recovery-example/src/deterministic.ts`.

### Determine Secret ID

We need to retrieve the ID of the secret that was used to encrypt our piece of data so the encrypted secret can be retrieved from backups.

Deterministic data encrypted with the Tenant Security Clients (`tsc-java 6+`, `tsc-nodejs 3+`, not supported in `tsc-php` or `tsc-go`) or with IronCore Alloy's SaaS Shield deterministic client starts with the same 6 bytes:

```
SECRET_ID (4 bytes, big-endian Uint32)
TYPE (1 byte, 0 for SaaS Shield deterministic data)
PADDING (1 byte, 0)
ENCRYPTED_DATA (the rest)
```

The TSCs write both of the last two bytes as padding. IronCore Alloy uses the first of them to mark what kind of key and data follow, which is zero for SaaS Shield deterministic data. See the [ironcore-alloy](https://github.com/IronCoreLabs/ironcore-alloy/blob/main/src/deterministic.rs) and [ironcore-documents](https://github.com/IronCoreLabs/ironcore-documents) source code for the most up-to-date information.

`SECRET_ID` is the secret's `numericId` in a backed-up secret. Match on that rather than `tenantSecretId`, which identifies the underlying secret and is a different number (they happen to match in this example's data).

### Retrieve Secret

Encrypted tenant secrets are available from the Configuration Broker and should be regularly backed up.

In the UI a `.zip` of encrypted tenant secrets can be downloaded from the [Tenant Secrets page](https://config.ironcorelabs.com/app/kms/secrets) of the Configuration Broker. Look for a clickable download icon near the page title.

In the Vendor Bridge, a request to the [List Tenant Secrets](https://ironcore-labs.stoplight.io/docs/vendor-bridge/8ee4d2ba0dd9c-list-tenant-secrets) endpoint will return a `JSON` list of encrypted tenant secrets.

These encrypted secrets need to be backed up in a way that they can be reliably retrieved by `numericId` in a disaster scenario.

### Decrypt Secret

A backed-up secret's `encryptedSecret` is an EDEK in the same format as a document's, and its `kmsConfigId` names the KMS configuration that protected it. Decrypt it with the process described in [Retrieving the Document Encryption Key](#retrieving-the-document-encryption-key). The result is the 32-byte tenant secret. As with documents, without access to the Configuration Broker it won't be clear which of the tenant's KMS key paths and credentials that configuration used. In a true disaster scenario, you'll need to work with the tenant to either provide them with these secrets and have them try decryption with all their KMS keys, or have them provide you or your recovery tool with credentials that can access all their possible KMS keys to try.

### Create a Deterministic Key

Once you have the tenant's decrypted secret for this piece of data, you can create a deterministic key. Use the secret as a key to `HMAC-SHA512` sign over `"tenant_provided_id-derivation_path"`, where the tenant ID is the one your application passes to the TSC and the derivation path is the one it passed when encrypting the data. The secret path only chose which secret was used, so it isn't part of the string. The 64-byte output of the hash is the deterministic key used to decrypt the actual data.

### Decrypt the Data

Use the deterministic key to `AES-256-SIV` ([RFC 5297](https://www.rfc-editor.org/rfc/rfc5297)) decrypt `ENCRYPTED_DATA`, everything after the 6-byte prefix. There is no `AES-SIV` associated data on IronCore deterministic values. Some `AES-SIV` libraries treat no associated data differently from a single empty piece of associated data, so make sure you pass none.

### Example Run Output

Code for this process is in `src/deterministic.ts`. It can be run with `yarn && yarn deterministic` if you have IronCore GCP credentials and `protoc` on your path. This same code could be modified or expanded on to work for your real data or recovery process, but it is not itself production quality code.

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
