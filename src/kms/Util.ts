import Future from "futurejs";
import {ironcorelabs} from "../../proto/ts/DocumentHeader";
import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";
import {CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, HEADER_FIXED_SIZE_CONTENT_LENGTH} from "./Constants";
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
const verifyAndCreateDocHeaderPb = (pbBytes: Buffer): Future<TenantSecurityClientException, ironcorelabs.proto.ISaaSShieldHeader> => {
    const invalidDoc = Future.reject(
        new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document.")
    );
    if (typeof v3DocumentHeader.verify({saasShield: pbBytes}) === "string") {
        return invalidDoc;
    }
    const header = v3DocumentHeader.decode(pbBytes);
    return header.saasShield === null || header.saasShield === undefined ? invalidDoc : Future.of(header.saasShield);
};

/**
 * Returns true if the provided document is an IronCore CMK encrypted document. Checks that we have the expected header on the front
 * of the document.
 */
export const isCmkEncryptedDocument = (bytes: Buffer): boolean =>
    bytes.length > HEADER_FIXED_SIZE_CONTENT_LENGTH && bytes[0] === CURRENT_DOCUMENT_HEADER_VERSION[0] && containsIroncoreMagic(bytes);

/**
 * Take the provided encrypted document, verify that it's a CMK document, and split out the optional protobuf header from the encrypted data. Returns
 * an object with an optional header and the remaining encrypted bytes.
 */
export const extractDocumentHeaderFromBytes = (
    bytes: Buffer
): Future<TenantSecurityClientException, {header?: ironcorelabs.proto.ISaaSShieldHeader; encryptedDoc: Buffer}> => {
    if (!isCmkEncryptedDocument(bytes)) {
        return Future.reject(new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document."));
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
 * dynamic protobuf header content and attempts to convert it to our expected Probobuf header.
 */
export const extractDocumentHeaderFromStream = (
    inputStream: NodeJS.ReadableStream
): Future<TenantSecurityClientException, ironcorelabs.proto.ISaaSShieldHeader | undefined> =>
    new Future<TenantSecurityClientException, Buffer | undefined>((reject, resolve) => {
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
                return reject(new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Was not able to read from encrypted file stream."));
            }
            const protobufHeaderLength = getHeaderProtobufContentSize(fixedHeaderBytes);
            if (protobufHeaderLength === 0) {
                return onComplete(undefined);
            }
            const protobufHeaderContent = inputStream.read(protobufHeaderLength) as Buffer;
            if (protobufHeaderContent === null || protobufHeaderContent.length < HEADER_FIXED_SIZE_CONTENT_LENGTH) {
                return reject(
                    new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided file stream was not a valid encrypted document.")
                );
            }
            onComplete(protobufHeaderContent);
        };
        inputStream.on("readable", onRead);
    }).flatMap((maybeHeader) => (maybeHeader ? verifyAndCreateDocHeaderPb(maybeHeader) : Future.of(undefined)));
