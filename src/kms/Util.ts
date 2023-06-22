import Future from "futurejs";
import {ironcorelabs} from "../../proto/ts/DocumentHeader";
import {TenantSecurityErrorCode, TenantSecurityException} from "../TenantSecurityException";
import {TscException} from "../TscException";
import {
    CURRENT_DOCUMENT_HEADER_VERSION,
    DOCUMENT_MAGIC,
    HEADER_FIXED_SIZE_CONTENT_LENGTH,
    DETERMINISTIC_HEADER_FIXED_SIZE_CONTENT_LENGTH,
    DETERMINISTIC_HEADER_PADDING,
} from "./Constants";
import {DeriveKeyResponse} from "./KmsApi";
const v3DocumentHeader = ironcorelabs.proto.v3DocumentHeader;

/**
 * Check that the given bytes contain the expected CMK magic header
 */
const containsIroncoreMagic = (bytes: Buffer): boolean => bytes.length >= 5 && bytes.slice(1, 5).equals(DOCUMENT_MAGIC);

/**
 * Read out the big-endian two byte number from the provided encrypted document
 */
const getHeaderProtobufContentSize = (bytes: Buffer): number => bytes.readUInt16BE(CURRENT_DOCUMENT_HEADER_VERSION.length + DOCUMENT_MAGIC.length);

/**
 * Verify that the provided bytes are our Protobuf header bytes.
 */
const verifyAndCreateDocHeaderPb = (pbBytes: Buffer): Future<TenantSecurityException, ironcorelabs.proto.Iv3DocumentHeader> => {
    const invalidDoc = new TscException(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document.");
    if (typeof v3DocumentHeader.verify({saasShield: pbBytes}) === "string") {
        return Future.reject(invalidDoc);
    }
    return Future.tryF(() => v3DocumentHeader.decode(pbBytes))
        .errorMap(() => invalidDoc)
        .flatMap((header) => (header.saasShield === null ? Future.reject(invalidDoc) : Future.of(header)));
};

/**
 * Returns true if the provided document is an IronCore CMK encrypted document. Checks that we have the expected header on the front
 * of the document.
 */
export const isCmkEncryptedDocument = (bytes: Buffer): boolean =>
    bytes.length > HEADER_FIXED_SIZE_CONTENT_LENGTH && bytes[0] === CURRENT_DOCUMENT_HEADER_VERSION[0] && containsIroncoreMagic(bytes);

/**
 * Returns true if the provided document is an IronCore deterministic encrypted field. Checks that we have the expected header on the front
 * of the field.
 */
export const isDeterministicEncryptedField = (bytes: Buffer): boolean =>
    bytes.length > DETERMINISTIC_HEADER_FIXED_SIZE_CONTENT_LENGTH && Buffer.compare(bytes.slice(4, 6), DETERMINISTIC_HEADER_PADDING) === 0;

/**
 * Take the provided encrypted document, verify that it's a CMK document, and split out the optional protobuf header from the encrypted data. Returns
 * an object with an optional header and the remaining encrypted bytes.
 */
export const extractDocumentHeaderFromBytes = (
    bytes: Buffer
): Future<TenantSecurityException, {header?: ironcorelabs.proto.Iv3DocumentHeader; encryptedDoc: Buffer}> => {
    if (!isCmkEncryptedDocument(bytes)) {
        return Future.reject(new TscException(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document."));
    }
    const protobufHeaderSize = getHeaderProtobufContentSize(bytes);
    if (protobufHeaderSize === 0) {
        //This document has no protobuf header content
        return Future.of({header: undefined, encryptedDoc: bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH)});
    }
    const protobufHeaderContent = bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH, HEADER_FIXED_SIZE_CONTENT_LENGTH + protobufHeaderSize);
    const encryptedDoc = bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH + protobufHeaderSize);
    return verifyAndCreateDocHeaderPb(protobufHeaderContent).map((header) => ({
        header,
        encryptedDoc,
    }));
};

/**
 * Attempt to read out the header of the provided stream without flowing the data. Reads out the fixed size header first, then reads out the
 * dynamic protobuf header content and attempts to convert it to our expected Protobuf header.
 */
export const extractDocumentHeaderFromStream = (
    inputStream: NodeJS.ReadableStream
): Future<TenantSecurityException, ironcorelabs.proto.Iv3DocumentHeader | undefined> =>
    new Future<TenantSecurityException, Buffer | undefined>((reject, resolve) => {
        const onComplete = (resolvedValue: Buffer | undefined) => {
            //Remove our readable event listener so we can switch this stream to flowing mode once we start decrypting.
            //eslint-disable-next-line @typescript-eslint/no-use-before-define
            inputStream.removeListener("readable", onRead);
            resolve(resolvedValue);
        };

        let hasRead = false;
        const onRead = () => {
            if (hasRead) {
                return;
            }
            hasRead = true;
            const fixedHeaderBytes = inputStream.read(HEADER_FIXED_SIZE_CONTENT_LENGTH) as Buffer;
            if (fixedHeaderBytes === null || fixedHeaderBytes.length < HEADER_FIXED_SIZE_CONTENT_LENGTH) {
                return reject(new TscException(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT, "Was not able to read from encrypted file stream."));
            }
            const protobufHeaderLength = getHeaderProtobufContentSize(fixedHeaderBytes);
            if (protobufHeaderLength === 0) {
                return onComplete(undefined);
            }
            const protobufHeaderContent = inputStream.read(protobufHeaderLength) as Buffer;
            if (protobufHeaderContent === null || protobufHeaderContent.length < HEADER_FIXED_SIZE_CONTENT_LENGTH) {
                return reject(new TscException(TenantSecurityErrorCode.INVALID_ENCRYPTED_DOCUMENT, "Provided file stream was not a valid encrypted document."));
            }
            onComplete(protobufHeaderContent);
        };
        inputStream.on("readable", onRead);
    }).flatMap((maybeHeader) => (maybeHeader ? verifyAndCreateDocHeaderPb(maybeHeader) : Future.of(undefined)));

/**
 * Ensure that the deriveKeyResponse indicates that the tenant has a primary KMS config, otherwise error.
 */
export const verifyHasPrimaryConfig = (
    deriveKeyResponse: DeriveKeyResponse,
    errorCode: TenantSecurityErrorCode
): Future<TenantSecurityException, DeriveKeyResponse> => {
    if (deriveKeyResponse.hasPrimaryConfig) {
        return Future.of(deriveKeyResponse);
    } else {
        return Future.reject(new TscException(errorCode, "The provided tenant has no primary KMS configuration"));
    }
};
