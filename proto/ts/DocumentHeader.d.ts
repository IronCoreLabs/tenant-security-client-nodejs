import * as $protobuf from "protobufjs";
/** Namespace ironcorelabs. */
export namespace ironcorelabs {

    /** Namespace proto. */
    namespace proto {

        /** Namespace cmk. */
        namespace cmk {

            /** Properties of a DocumentHeader. */
            interface IDocumentHeader {

                /** DocumentHeader encryptedDekData */
                encryptedDekData?: (Uint8Array|null);
            }

            /** Represents a DocumentHeader. */
            class DocumentHeader implements IDocumentHeader {

                /**
                 * Constructs a new DocumentHeader.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ironcorelabs.proto.cmk.IDocumentHeader);

                /** DocumentHeader encryptedDekData. */
                public encryptedDekData: Uint8Array;

                /**
                 * Creates a new DocumentHeader instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DocumentHeader instance
                 */
                public static create(properties?: ironcorelabs.proto.cmk.IDocumentHeader): ironcorelabs.proto.cmk.DocumentHeader;

                /**
                 * Encodes the specified DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.cmk.DocumentHeader.verify|verify} messages.
                 * @param message DocumentHeader message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ironcorelabs.proto.cmk.IDocumentHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DocumentHeader message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DocumentHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.cmk.DocumentHeader;

                /**
                 * Verifies a DocumentHeader message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DocumentHeader message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DocumentHeader
                 */
                public static fromObject(object: { [k: string]: any }): ironcorelabs.proto.cmk.DocumentHeader;

                /**
                 * Creates a plain object from a DocumentHeader message. Also converts values to other types if specified.
                 * @param message DocumentHeader
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ironcorelabs.proto.cmk.DocumentHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DocumentHeader to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
