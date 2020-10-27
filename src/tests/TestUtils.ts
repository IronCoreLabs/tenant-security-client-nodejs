import "jest-extended";
import {PlaintextDocument, PlaintextDocumentCollection, PlaintextDocumentWithEdekCollection, TenantSecurityClient} from "../../tenant-security-nodejs";
import {DocumentMetadata} from "../kms/DocumentMetadata";

export const getDataToEncrypt = (): PlaintextDocument => ({
    field1: Buffer.from("Cras sit amet neque vel eros fermentum molestie.", "utf8"),
    field2: Buffer.from("Donec pretium, ipsum molestie rhoncus aliquet, odio libero ultrices ipsum, ac blandit elit purus tristique massa."),
    field3: Buffer.from(
        "Phasellus non porta ante. Proin in diam vel tortor faucibus molestie. Proin a urna turpis. In condimentum iaculis lacus sit amet placerat."
    ),
});

export const getBatchDataToEncrypt = (): PlaintextDocumentCollection => ({
    batch1: getDataToEncrypt(),
    batch2: getDataToEncrypt(),
    batch3: getDataToEncrypt(),
    batch4: getDataToEncrypt(),
    batch5: getDataToEncrypt(),
});

export const getMetadata = (tenant: string) =>
    new DocumentMetadata(tenant, "nodejs-dev-integration-test", "lipsum", "integration-test-ray-id", undefined, undefined, {thingOne: "thingTwo"});

export const assertEncryptedData = (client: TenantSecurityClient, encryptedDocument: Record<string, Buffer>) => {
    const data = getDataToEncrypt();
    expect(encryptedDocument.field1).toBeInstanceOf(Buffer);
    expect(encryptedDocument.field1.length).toBeGreaterThan(data.field1.length);
    expect(client.isCiphertext(encryptedDocument.field1)).toBeTrue();
    expect(encryptedDocument.field2).toBeInstanceOf(Buffer);
    expect(encryptedDocument.field2.length).toBeGreaterThan(data.field2.length);
    expect(client.isCiphertext(encryptedDocument.field2)).toBeTrue();
    expect(encryptedDocument.field3).toBeInstanceOf(Buffer);
    expect(encryptedDocument.field3.length).toBeGreaterThan(data.field3.length);
    expect(client.isCiphertext(encryptedDocument.field3)).toBeTrue();
};

export const runSingleDocumentRoundTripForTenant = async (client: TenantSecurityClient, tenant: string) => {
    const metadata = getMetadata(tenant);
    const data = getDataToEncrypt();

    const {edek, encryptedDocument} = await client.encryptDocument(data, metadata);
    expect(edek).not.toBeEmpty();
    assertEncryptedData(client, encryptedDocument);

    const decryptResult = await client.decryptDocument({edek, encryptedDocument}, metadata);

    expect(decryptResult.edek).toEqual(edek);
    expect(decryptResult.plaintextDocument.field1).toEqual(data.field1);
};

export const runSingleExistingDocumentRoundTripForTenant = async (client: TenantSecurityClient, tenant: string) => {
    const metadata = getMetadata(tenant);
    const data = getDataToEncrypt();

    const firstEncrypt = await client.encryptDocument(data, metadata);
    const {edek, encryptedDocument} = await client.encryptDocumentWithExistingKey({edek: firstEncrypt.edek, plaintextDocument: data}, metadata);

    expect(edek).not.toBeEmpty();
    assertEncryptedData(client, encryptedDocument);

    //Should be able to decrypt using the first EDEK we got back
    const res = await client.decryptDocument({edek: firstEncrypt.edek, encryptedDocument}, metadata);

    expect(res.edek).toEqual(edek);
    expect(res.plaintextDocument.field1).toEqual(data.field1);
    expect(res.plaintextDocument.field2).toEqual(data.field2);
    expect(res.plaintextDocument.field3).toEqual(data.field3);
};

export const runBatchDocumentRoundtripForTenant = async (client: TenantSecurityClient, tenant: string) => {
    const metadata = getMetadata(tenant);
    const data = getBatchDataToEncrypt();

    const encryptResult = await client.encryptDocumentBatch(data, metadata);

    expect(encryptResult.hasFailures).toBeFalse();
    expect(encryptResult.failures).toBeEmpty();
    expect(encryptResult.hasSuccesses).toBeTrue();

    expect(encryptResult.successes.batch1.edek).not.toBeEmpty();
    assertEncryptedData(client, encryptResult.successes.batch1.encryptedDocument);
    expect(encryptResult.successes.batch2.edek).not.toBeEmpty();
    assertEncryptedData(client, encryptResult.successes.batch2.encryptedDocument);
    expect(encryptResult.successes.batch3.edek).not.toBeEmpty();
    assertEncryptedData(client, encryptResult.successes.batch3.encryptedDocument);
    expect(encryptResult.successes.batch4.edek).not.toBeEmpty();
    assertEncryptedData(client, encryptResult.successes.batch4.encryptedDocument);
    expect(encryptResult.successes.batch5.edek).not.toBeEmpty();
    assertEncryptedData(client, encryptResult.successes.batch5.encryptedDocument);

    const decryptResult = await client.decryptDocumentBatch(encryptResult.successes, metadata);

    expect(decryptResult.hasFailures).toBeFalse();
    expect(decryptResult.failures).toBeEmpty();
    expect(decryptResult.hasSuccesses).toBeTrue();

    expect(decryptResult.successes.batch1.plaintextDocument).toEqual(data.batch1);
    expect(decryptResult.successes.batch2.plaintextDocument).toEqual(data.batch2);
    expect(decryptResult.successes.batch3.plaintextDocument).toEqual(data.batch3);
    expect(decryptResult.successes.batch4.plaintextDocument).toEqual(data.batch4);
    expect(decryptResult.successes.batch5.plaintextDocument).toEqual(data.batch5);
};

export const runReusedBatchDocumentRoundtripForTenant = async (client: TenantSecurityClient, tenant: string) => {
    const metadata = getMetadata(tenant);
    const data = getBatchDataToEncrypt();

    const firstEncrypt = await client.encryptDocumentBatch(data, metadata);
    expect(firstEncrypt.hasFailures).toBeFalse();
    expect(firstEncrypt.failures).toBeEmpty();
    expect(firstEncrypt.hasSuccesses).toBeTrue();
    expect(Object.values(firstEncrypt.successes)).toHaveLength(5);

    const dataForReEncrypt = Object.entries(firstEncrypt.successes).reduce((currentMap, [docId, {edek}]) => {
        currentMap[docId] = {edek, plaintextDocument: data[docId]};
        return currentMap;
    }, {} as PlaintextDocumentWithEdekCollection);

    const reencryptResult = await client.encryptDocumentBatchWithExistingKey(dataForReEncrypt, metadata);

    expect(reencryptResult.hasFailures).toBeFalse();
    expect(reencryptResult.failures).toBeEmpty();
    expect(reencryptResult.hasSuccesses).toBeTrue();
    expect(Object.values(reencryptResult.successes)).toHaveLength(5);

    expect(reencryptResult.successes.batch1.edek).not.toBeEmpty();
    assertEncryptedData(client, reencryptResult.successes.batch1.encryptedDocument);
    expect(reencryptResult.successes.batch2.edek).not.toBeEmpty();
    assertEncryptedData(client, reencryptResult.successes.batch2.encryptedDocument);
    expect(reencryptResult.successes.batch3.edek).not.toBeEmpty();
    assertEncryptedData(client, reencryptResult.successes.batch3.encryptedDocument);
    expect(reencryptResult.successes.batch4.edek).not.toBeEmpty();
    assertEncryptedData(client, reencryptResult.successes.batch4.encryptedDocument);
    expect(reencryptResult.successes.batch5.edek).not.toBeEmpty();
    assertEncryptedData(client, reencryptResult.successes.batch5.encryptedDocument);

    const decryptResult = await client.decryptDocumentBatch(reencryptResult.successes, metadata);

    expect(decryptResult.hasFailures).toBeFalse();
    expect(decryptResult.failures).toBeEmpty();
    expect(decryptResult.hasSuccesses).toBeTrue();

    expect(decryptResult.successes.batch1.plaintextDocument).toEqual(data.batch1);
    expect(decryptResult.successes.batch2.plaintextDocument).toEqual(data.batch2);
    expect(decryptResult.successes.batch3.plaintextDocument).toEqual(data.batch3);
    expect(decryptResult.successes.batch4.plaintextDocument).toEqual(data.batch4);
    expect(decryptResult.successes.batch5.plaintextDocument).toEqual(data.batch5);
};
