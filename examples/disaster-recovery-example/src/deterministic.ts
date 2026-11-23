import * as crypto from "crypto";
import {aessiv} from "@noble/ciphers/aes.js";
import {retrieveDek} from "./index";

// Only run through the example if this module was executed (vs imported).
if (require.main == module) {
    (async () => {
        /*
        These values were taken from the `deterministic-roundtrip` example 1, when run with `tenant-gcp` from the demo deployment.
        In a real situation these would be the values that you have stored in your database or other persistence layer.
        */
        const deterministicEncryptedValue = Buffer.from([
            0, 0, 19, 247, 0, 0, 120, 82, 176, 74, 41, 28, 85, 84, 151, 164, 104, 252, 207, 111, 251, 109, 137, 3, 164, 75, 158, 246, 69, 37, 83, 19, 163,
        ]);
        console.log(`Deterministic Encrypted Value:
          ${deterministicEncryptedValue.toString("base64")}`);
        /*
        The first 4 bytes of the deterministic value are the secret ID, as a big-endian Uint32, followed by 2 bytes of
        padding. In this case it's 5111.
        */
        const secretId = deterministicEncryptedValue.readUInt32BE(0);
        console.log(`Recovered Secret ID:
          ${secretId}`);

        /*
        We took that secretId and pulled out its secret from our manual backup with
        `cat secret-recovery.json | jq '.result | map(select(.numericId == secretId))'`.
        The secret ID is the backup's `numericId`, not its `tenantSecretId`, though the two happen to match here.
        The same thing could be programmatically done if you have the secret backed up in a DB or file,
        or still have access to the Config Broker by way of the Vendor Bridge or UI.

        WARNING: You must back up encrypted secrets periodically to avoid data loss! See the [data continuity documentation](https://ironcorelabs.com/docs/saas-shield/data-continuity/)
                 for information on obtaining backups of encrypted secrets.
        */
        const backedUpSecret = {
            tenantProvidedId: "tenant-gcp",
            numericId: 5111,
            id: "4a7f76dd-a0fb-4642-b15b-8423a983cc88",
            tenantSecretId: 5111,
            secretFingerprint: "tMoo5p0wpn3J2AS3iJptVWAS19B9zvj1nDGltf40wos=",
            secretPath: "secretPath",
            kmsConfigId: 510,
            migrationStatus: 1,
            encryptedSecret:
                "CnYKcQokAAWBd/OMpxQKZ7Fzm7WnD1vprk6t5a2Cx1OS5ZaTd3Qez6Q9EkkA8xjtHtVE4ZD8CMqa1bWVwiTggI/McQvx7+bvuytA9ztnivj08xOIIJy2zV9aU2w9RykpEXPk7pXZCLT3vMtt+5dho9m8igg6EP4D",
            rotationStatus: 1,
            secretType: 2,
            created: 1689877493455,
            updated: 1689877493455,
        };
        console.log(`Retrieved Backup Secret: ${JSON.stringify(backedUpSecret, null, "\t")}`);

        /*
        To decrypt the secret itself we need to follow the same process we do for other standard encrypted IronCore documents. See
        `disaster-recovery-example/src/index.ts` for that process. We'll call out to that file from here instead of repeating ourselves.
        */
        console.log("Decrypting Backup Secret with Tenant's GCP KMS using provided credentials...");
        const decryptedSecret = await retrieveDek(backedUpSecret.encryptedSecret);
        console.log(`Decrypted Backup Secret:
          ${Buffer.from(decryptedSecret).toString("base64")}`);

        /*
        Use the decrypted secret as a key in a HMAC-SHA512 hash to get the deterministic key. You can see that you need
        to know what derivation path you called the TSC with for any given data in your system (which you already do or it's
        not decryptable). The tenant ID is the one your application passes to the TSC, and the secret path isn't part of
        the string.
        */
        const derivationString = `${backedUpSecret.tenantProvidedId}-derivPath`;
        console.log(`Hashing Over Tenant String:
          ${derivationString}`);
        const hmac = crypto.createHmac("sha512", decryptedSecret);
        hmac.update(derivationString);
        const deterministicKey = hmac.digest();
        console.log(`Recovered Deterministic Key:
          ${deterministicKey.toString("base64")}`);

        /*
        We can now use the recovered `deterministicKey` to AES-SIV decrypt the deterministic data. This part of the
        process will vary the most language to language as AES-SIV libraries all have slight differences in interface.
        There is no AES-SIV associated data attached to IronCore deterministic values, so pass none rather than a single
        empty piece, which some libraries treat differently.
        */
        console.log("AES-SIV Decrypting Deterministic Data...");
        // slice past the secretId and padding to the ciphertext
        const recoveredData = Buffer.from(aessiv(deterministicKey).decrypt(deterministicEncryptedValue.slice(6)));
        console.log(`Recovered Data:
          ${recoveredData.toString("base64")}`);
        const recoveredString = recoveredData.toString("utf8");
        console.log(`Original Data (String):
          ${recoveredString}`);
    })().catch((e) => {
        console.log(e);
    });
}
