import Future from "futurejs";
import {ironcorelabs} from "../../proto/ts/DocumentHeader";
import {ErrorCodes, TenantSecurityClientException} from "../TenantSecurityClientException";
import {CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, HEADER_FIXED_SIZE_CONTENT_LENGTH, HEADER_META_LENGTH_LENGTH} from "./Constants";
const DocumentHeader = ironcorelabs.proto.cmk.DocumentHeader;

/**
 * Check that the given bytes contain the expected CMK magic header
 */
const containsIroncoreMagic = (bytes: Buffer): boolean => bytes.length >= 5 && bytes.slice(1, 5).equals(DOCUMENT_MAGIC);

/**
 * Multiply the header size bytes at the 5th and 6th indices to get the header size. If those bytes don't exist this will throw.
 */
const getHeaderProtobufContentSize = (bytes: Buffer): number => bytes.readInt16BE(5);

/**
 * Verify that the provided bytes are our Protobuf header bytes.
 */
const verifyAndCreateDocHeader = (pbBytes: Buffer): Future<TenantSecurityClientException, ironcorelabs.proto.cmk.IDocumentHeader> =>
    typeof DocumentHeader.verify({encryptedDekData: pbBytes}) === "string"
        ? Future.reject(new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document."))
        : Future.of(DocumentHeader.decode(pbBytes));

/**
 * Return the header bytes for all IronCore CMK encrypted documents. Optionally inserts the EDEK for this document into the
 * header as protobuf if provided.
 */
export const generateHeader = (edek?: Buffer): Buffer => {
    let protobufHeaderLength = Buffer.from([0, 0]);
    let protobufHeaderContent = Buffer.from([]);
    if (edek && edek.length) {
        protobufHeaderContent = Buffer.from(DocumentHeader.encode({encryptedDekData: edek}).finish());
        const headerDataView = new DataView(new ArrayBuffer(HEADER_META_LENGTH_LENGTH));
        headerDataView.setUint16(0, protobufHeaderContent.length, false);
        protobufHeaderLength = Buffer.from(headerDataView.buffer);
    }
    return Buffer.concat([CURRENT_DOCUMENT_HEADER_VERSION, DOCUMENT_MAGIC, protobufHeaderLength, protobufHeaderContent]);
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
export const splitDocumentHeaderAndEncryptedContent = (
    bytes: Buffer
): Future<TenantSecurityClientException, {header: ironcorelabs.proto.cmk.IDocumentHeader | undefined; encryptedDoc: Buffer}> => {
    if (!isCmkEncryptedDocument(bytes)) {
        return Future.reject(new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided bytes are not a CMK encrypted document."));
    }
    const protobufHeaderSize = getHeaderProtobufContentSize(bytes);
    if (protobufHeaderSize === 0) {
        //This document has no protobuf header content
        return Future.of({header: undefined, encryptedDoc: bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH)});
    }
    const protobufHeaderContent = bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH, protobufHeaderSize);
    const encryptedDoc = bytes.slice(HEADER_FIXED_SIZE_CONTENT_LENGTH + protobufHeaderSize);
    return verifyAndCreateDocHeader(protobufHeaderContent).map((header) => ({
        header,
        encryptedDoc,
    }));
};

/**
 * Attempt to read out the header of the provided stream without flowing the data. Reads out the fixed size header first, then reads out the
 * dynamic protobuf header content to extract the EDEK that should be at the front of the data.
 */
export const extractDocumentHeaderFromStream = (
    inputStream: NodeJS.ReadableStream
): Future<TenantSecurityClientException, ironcorelabs.proto.cmk.IDocumentHeader> =>
    new Future<TenantSecurityClientException, Buffer>((reject, resolve) => {
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
            const protobufHeaderContent = inputStream.read(protobufHeaderLength) as Buffer;
            if (protobufHeaderContent === null || protobufHeaderContent.length < HEADER_FIXED_SIZE_CONTENT_LENGTH) {
                return reject(
                    new TenantSecurityClientException(ErrorCodes.INVALID_ENCRYPTED_DOCUMENT, "Provided file stream was not a valid encrypted document.")
                );
            }
            //Remove our readable event listener so we can switch this stream to flowing mode once we start decrypting.
            inputStream.removeListener("readable", onRead);
            resolve(protobufHeaderContent);
        };
        inputStream.on("readable", onRead);
    }).flatMap(verifyAndCreateDocHeader);
