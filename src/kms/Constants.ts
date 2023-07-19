export const AES_ALGORITHM = "aes-256-gcm";
export const IV_BYTE_LENGTH = 12;
export const AES_GCM_TAG_LENGTH = 16;
//Current version of IronCore encrypted documents
export const CURRENT_DOCUMENT_HEADER_VERSION = Buffer.from([3]);
//IRON in ascii. Used to better denote whether this is an IronCore encrypted document
export const DOCUMENT_MAGIC = Buffer.from([73, 82, 79, 78]);
//The number of bytes that we use to represent the length of our header protobuf
export const HEADER_META_LENGTH_LENGTH = 2;
//The number of fixed size bytes of header at the front of all CMK documents. After this length is the protobuf-encoded header bytes, which
//might be empty.
export const HEADER_FIXED_SIZE_CONTENT_LENGTH = CURRENT_DOCUMENT_HEADER_VERSION.length + DOCUMENT_MAGIC.length + HEADER_META_LENGTH_LENGTH;
export const DETERMINISTIC_HEADER_PADDING = Buffer.from([0, 0]);
// The number of bytes we encode the tenant secret ID into at the start of the encrypted field.
export const DETERMINISTIC_SECRET_ID_LENGTH = 4;
export const DETERMINISTIC_HEADER_FIXED_SIZE_CONTENT_LENGTH = DETERMINISTIC_SECRET_ID_LENGTH + DETERMINISTIC_HEADER_PADDING.length;
// We encode the tenant secret ID into 4 bytes
export const MAX_TENANT_SECRET_ID = 4294967295;
