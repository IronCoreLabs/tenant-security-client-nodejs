# Disaster Recovery Example
This provides an example of the code and knowledge required to recover documents encrypted using SaaS Shield in the case of catastrophic IronCore Labs failure. This should never have to happen, even in the event of stopping usage of IronCore you will still be able to migrate documents out of the system more easily than this. This is pretty strictly an "IronCore and all their services were hit by a meteor storm" or "I'm an archeologist trying to recover lost encrypted data" situation.

This example uses previously encrypted data from the other examples and when run deconstructs that data and reconstitutes the original decrypted data.

The credentials to make running this yourself aren't provided, but you can see the code and example output for more information about what is happening.

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
