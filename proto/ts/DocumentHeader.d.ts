import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace ironcorelabs. */
export namespace ironcorelabs {

    /** Namespace proto. */
    namespace proto {

        /**
         * Properties of a DataControlPlatformHeader.
         * @deprecated Use ironcorelabs.proto.DataControlPlatformHeader.$Properties instead.
         */
        interface IDataControlPlatformHeader extends ironcorelabs.proto.DataControlPlatformHeader.$Properties {
        }

        /** Represents a DataControlPlatformHeader. */
        class DataControlPlatformHeader {

            /**
             * Constructs a new DataControlPlatformHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.DataControlPlatformHeader.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** DataControlPlatformHeader documentId. */
            documentId: string;

            /** DataControlPlatformHeader segmentId. */
            segmentId: (number|Long);

            /**
             * Creates a new DataControlPlatformHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DataControlPlatformHeader instance
             */
            static create(properties: ironcorelabs.proto.DataControlPlatformHeader.$Shape): ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape;
            static create(properties?: ironcorelabs.proto.DataControlPlatformHeader.$Properties): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Encodes the specified DataControlPlatformHeader message. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @param message DataControlPlatformHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: ironcorelabs.proto.DataControlPlatformHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DataControlPlatformHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @param message DataControlPlatformHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: ironcorelabs.proto.DataControlPlatformHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape;

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape;

            /**
             * Verifies a DataControlPlatformHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DataControlPlatformHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DataControlPlatformHeader
             */
            static fromObject(object: { [k: string]: any }): ironcorelabs.proto.DataControlPlatformHeader;

            /**
             * Creates a plain object from a DataControlPlatformHeader message. Also converts values to other types if specified.
             * @param message DataControlPlatformHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: ironcorelabs.proto.DataControlPlatformHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DataControlPlatformHeader to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for DataControlPlatformHeader
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace DataControlPlatformHeader {

            /** Properties of a DataControlPlatformHeader. */
            interface $Properties {

                /** DataControlPlatformHeader documentId */
                documentId?: (string|null);

                /** DataControlPlatformHeader segmentId */
                segmentId?: (number|Long|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a DataControlPlatformHeader. */
            type $Shape = ironcorelabs.proto.DataControlPlatformHeader.$Properties;
        }

        /**
         * Properties of a SaaSShieldHeader.
         * @deprecated Use ironcorelabs.proto.SaaSShieldHeader.$Properties instead.
         */
        interface ISaaSShieldHeader extends ironcorelabs.proto.SaaSShieldHeader.$Properties {
        }

        /** Represents a SaaSShieldHeader. */
        class SaaSShieldHeader {

            /**
             * Constructs a new SaaSShieldHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.SaaSShieldHeader.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** SaaSShieldHeader tenantId. */
            tenantId: string;

            /**
             * Creates a new SaaSShieldHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SaaSShieldHeader instance
             */
            static create(properties: ironcorelabs.proto.SaaSShieldHeader.$Shape): ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape;
            static create(properties?: ironcorelabs.proto.SaaSShieldHeader.$Properties): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Encodes the specified SaaSShieldHeader message. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @param message SaaSShieldHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: ironcorelabs.proto.SaaSShieldHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SaaSShieldHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @param message SaaSShieldHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: ironcorelabs.proto.SaaSShieldHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape;

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape;

            /**
             * Verifies a SaaSShieldHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SaaSShieldHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SaaSShieldHeader
             */
            static fromObject(object: { [k: string]: any }): ironcorelabs.proto.SaaSShieldHeader;

            /**
             * Creates a plain object from a SaaSShieldHeader message. Also converts values to other types if specified.
             * @param message SaaSShieldHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: ironcorelabs.proto.SaaSShieldHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SaaSShieldHeader to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for SaaSShieldHeader
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace SaaSShieldHeader {

            /** Properties of a SaaSShieldHeader. */
            interface $Properties {

                /** SaaSShieldHeader tenantId */
                tenantId?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a SaaSShieldHeader. */
            type $Shape = ironcorelabs.proto.SaaSShieldHeader.$Properties;
        }

        /**
         * Properties of a v3DocumentHeader.
         * @deprecated Use ironcorelabs.proto.v3DocumentHeader.$Properties instead.
         */
        interface Iv3DocumentHeader extends ironcorelabs.proto.v3DocumentHeader.$Properties {
        }

        /** Represents a v3DocumentHeader. */
        class v3DocumentHeader {

            /**
             * Constructs a new v3DocumentHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: ironcorelabs.proto.v3DocumentHeader.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** v3DocumentHeader sig. */
            sig: Uint8Array;

            /** v3DocumentHeader dataControl. */
            dataControl?: (ironcorelabs.proto.DataControlPlatformHeader.$Properties|null);

            /** v3DocumentHeader saasShield. */
            saasShield?: (ironcorelabs.proto.SaaSShieldHeader.$Properties|null);

            /** v3DocumentHeader header. */
            header?: ("dataControl"|"saasShield");

            /**
             * Creates a new v3DocumentHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns v3DocumentHeader instance
             */
            static create(properties: ironcorelabs.proto.v3DocumentHeader.$Shape): ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape;
            static create(properties?: ironcorelabs.proto.v3DocumentHeader.$Properties): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Encodes the specified v3DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @param message v3DocumentHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: ironcorelabs.proto.v3DocumentHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified v3DocumentHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @param message v3DocumentHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: ironcorelabs.proto.v3DocumentHeader.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape;

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape;

            /**
             * Verifies a v3DocumentHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a v3DocumentHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns v3DocumentHeader
             */
            static fromObject(object: { [k: string]: any }): ironcorelabs.proto.v3DocumentHeader;

            /**
             * Creates a plain object from a v3DocumentHeader message. Also converts values to other types if specified.
             * @param message v3DocumentHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: ironcorelabs.proto.v3DocumentHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this v3DocumentHeader to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for v3DocumentHeader
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace v3DocumentHeader {

            /** Properties of a v3DocumentHeader. */
            interface $Properties {

                /** v3DocumentHeader sig */
                sig?: (Uint8Array|null);

                /** v3DocumentHeader dataControl */
                dataControl?: (ironcorelabs.proto.DataControlPlatformHeader.$Properties|null);

                /** v3DocumentHeader saasShield */
                saasShield?: (ironcorelabs.proto.SaaSShieldHeader.$Properties|null);

                /** v3DocumentHeader header */
                header?: ("dataControl"|"saasShield");

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Narrowed shape of a v3DocumentHeader. */
            type $Shape = {
  sig?: Uint8Array|null;
  dataControl?: ironcorelabs.proto.DataControlPlatformHeader.$Shape|null;
  saasShield?: ironcorelabs.proto.SaaSShieldHeader.$Shape|null;
  $unknowns?: Uint8Array[];
} & (
  ({ header?: undefined; dataControl?: null; saasShield?: null }|{ header?: "dataControl"; dataControl: ironcorelabs.proto.DataControlPlatformHeader.$Shape; saasShield?: null }|{ header?: "saasShield"; dataControl?: null; saasShield: ironcorelabs.proto.SaaSShieldHeader.$Shape })
);
        }
    }
}
