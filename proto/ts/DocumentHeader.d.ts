import * as $protobuf from "protobufjs";
/** Namespace ironcorelabs. */
export namespace ironcorelabs {

    /** Namespace proto. */
    namespace proto {

        /** Properties of a DataControlPlatformHeader. */
        interface IDataControlPlatformHeader {

            /** DataControlPlatformHeader documentId */
            documentId?: (string|null);

            /** DataControlPlatformHeader segmentId */
            segmentId?: (number|Long|null);
        }

        /** Represents a DataControlPlatformHeader. */
        class DataControlPlatformHeader implements IDataControlPlatformHeader {

            /**
             * Constructs a new DataControlPlatformHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.IDataControlPlatformHeader);

            /** DataControlPlatformHeader documentId. */
            public documentId: string;

            /** DataControlPlatformHeader segmentId. */
            public segmentId: (number|Long);

            /**
             * Creates a new DataControlPlatformHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DataControlPlatformHeader instance
             */
            public static create(properties?: ironcorelabs.proto.IDataControlPlatformHeader): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Encodes the specified DataControlPlatformHeader message. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @param message DataControlPlatformHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: ironcorelabs.proto.IDataControlPlatformHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DataControlPlatformHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @param message DataControlPlatformHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: ironcorelabs.proto.IDataControlPlatformHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Verifies a DataControlPlatformHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DataControlPlatformHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DataControlPlatformHeader
             */
            public static fromObject(object: { [k: string]: any }): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Creates a plain object from a DataControlPlatformHeader message. Also converts values to other types if specified.
             * @param message DataControlPlatformHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: ironcorelabs.proto.DataControlPlatformHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DataControlPlatformHeader to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a SaaSShieldHeader. */
        interface ISaaSShieldHeader {

            /** SaaSShieldHeader tenantId */
            tenantId?: (string|null);
        }

        /** Represents a SaaSShieldHeader. */
        class SaaSShieldHeader implements ISaaSShieldHeader {

            /**
             * Constructs a new SaaSShieldHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.ISaaSShieldHeader);

            /** SaaSShieldHeader tenantId. */
            public tenantId: string;

            /**
             * Creates a new SaaSShieldHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SaaSShieldHeader instance
             */
            public static create(properties?: ironcorelabs.proto.ISaaSShieldHeader): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Encodes the specified SaaSShieldHeader message. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @param message SaaSShieldHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: ironcorelabs.proto.ISaaSShieldHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SaaSShieldHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @param message SaaSShieldHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: ironcorelabs.proto.ISaaSShieldHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Verifies a SaaSShieldHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SaaSShieldHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SaaSShieldHeader
             */
            public static fromObject(object: { [k: string]: any }): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Creates a plain object from a SaaSShieldHeader message. Also converts values to other types if specified.
             * @param message SaaSShieldHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: ironcorelabs.proto.SaaSShieldHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SaaSShieldHeader to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a v3DocumentHeader. */
        interface Iv3DocumentHeader {

            /** v3DocumentHeader sig */
            sig?: (Uint8Array|null);

            /** v3DocumentHeader dataControl */
            dataControl?: (ironcorelabs.proto.IDataControlPlatformHeader|null);

            /** v3DocumentHeader saasShield */
            saasShield?: (ironcorelabs.proto.ISaaSShieldHeader|null);
        }

        /** Represents a v3DocumentHeader. */
        class v3DocumentHeader implements Iv3DocumentHeader {

            /**
             * Constructs a new v3DocumentHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.Iv3DocumentHeader);

            /** v3DocumentHeader sig. */
            public sig: Uint8Array;

            /** v3DocumentHeader dataControl. */
            public dataControl?: (ironcorelabs.proto.IDataControlPlatformHeader|null);

            /** v3DocumentHeader saasShield. */
            public saasShield?: (ironcorelabs.proto.ISaaSShieldHeader|null);

            /** v3DocumentHeader header. */
            public header?: ("dataControl"|"saasShield");

            /**
             * Creates a new v3DocumentHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns v3DocumentHeader instance
             */
            public static create(properties?: ironcorelabs.proto.Iv3DocumentHeader): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Encodes the specified v3DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @param message v3DocumentHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: ironcorelabs.proto.Iv3DocumentHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified v3DocumentHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @param message v3DocumentHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: ironcorelabs.proto.Iv3DocumentHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Verifies a v3DocumentHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a v3DocumentHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns v3DocumentHeader
             */
            public static fromObject(object: { [k: string]: any }): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Creates a plain object from a v3DocumentHeader message. Also converts values to other types if specified.
             * @param message v3DocumentHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: ironcorelabs.proto.v3DocumentHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this v3DocumentHeader to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
