# Disaster Recovery Example
This provides an example of the code and knowledge required to recover documents encrypted using SaaS Shield in the case of catastrophic IronCore Labs failure. This should never have to happen, even in the event of stopping usage of IronCore you will still be able to migrate documents out of the system more easily than this. This is pretty strictly an "IronCore and all their services were hit by a meteor storm" or "I'm an archeologist trying to recover lost encrypted data" situation.

This example uses previously encrypted data from the other examples and when run deconstructs that data and reconstitutes the original decrypted data.

The credentials to make running this yourself aren't provided, but you can see the code and example output for more information about what is happening.

## Recovery Process

### Retrieving the Encrypted Bytes, GCM tag, and IV
In the `EncryptedDocumentMap` (`Map<String, byte[]>`) returned by the TSC, the `byte[]`’s are of the structure:

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

### Retrieving the Document Encryption Key
The DEK (Document Encryption Key) you need to decrypt the `ENCRYPTED_DATA` is the decrypted value of the EDEK (Encrypted DEK) that was also returned by the TSC.

The process to decrypt this differs based on whether a leased key was used or not.
The EDEK, provided by the TSC as a Base64 String, is actually a protobuf message with the structure:

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

#### Un-leased
If the `EncryptedDek.leasedKeyId` is `0` (zero) you can decrypt the DEK by calling unwrap on your (or the tenant’s) KMS, passing the `EncryptedDek.encryptedDekData` bytes, using the correct credentials and key path. The result will be the DEK which can then be used in the “Decrypting the Document” step. 

#### Leased
If the `EncryptedDek.leasedKeyId` is nonzero you need to unwrap the leased key before using it to decrypt the EDEK. The leased key itself is also an EDEK, so first retrieve `EncryptedDek.encryptedLeasedKeyData.encryptedDeks[0].encryptedDekData`. Then call unwrap on your (or the tenant’s) KMS, passing the those bytes, using the correct credentials and key. The response is the `DECRYPTED_LEASED_KEY`.

Use the `DECRYPTED_LEASED_KEY`, and the `EncryptedDek.leasedKeyIv` to AES decrypt the `EncryptedDek.encryptedDekData`. The result will be the DEK which can then be used in the “Decrypting the Document” step.

### Decrypting the Document
Once you have the `DEK`, `ENCRYPTED_DATA`, and `DATA_IV` you can make an AES decrypt call with all three of those parameters. The result will be the original bytes that were sent into the TSC for encryption.

### Gotchas
This is only possible if you have or can have access to the KMS credentials and key used by the involved account (vendor provided config or tenant provided). If you do have access to all iterations of those credentials and keys you then need to know, or exhaustively determine, which of them was used to encrypt the given document.


## Example Run Output
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
