/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.ironcorelabs = (function() {

    /**
     * Namespace ironcorelabs.
     * @exports ironcorelabs
     * @namespace
     */
    var ironcorelabs = {};

    ironcorelabs.proto = (function() {

        /**
         * Namespace proto.
         * @memberof ironcorelabs
         * @namespace
         */
        var proto = {};

        proto.DataControlPlatformHeader = (function() {

            /**
             * Properties of a DataControlPlatformHeader.
             * @memberof ironcorelabs.proto
             * @interface IDataControlPlatformHeader
             * @property {string|null} [documentId] DataControlPlatformHeader documentId
             * @property {number|Long|null} [segmentId] DataControlPlatformHeader segmentId
             */

            /**
             * Constructs a new DataControlPlatformHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a DataControlPlatformHeader.
             * @implements IDataControlPlatformHeader
             * @constructor
             * @param {ironcorelabs.proto.IDataControlPlatformHeader=} [properties] Properties to set
             */
            function DataControlPlatformHeader(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DataControlPlatformHeader documentId.
             * @member {string} documentId
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @instance
             */
            DataControlPlatformHeader.prototype.documentId = "";

            /**
             * DataControlPlatformHeader segmentId.
             * @member {number|Long} segmentId
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @instance
             */
            DataControlPlatformHeader.prototype.segmentId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new DataControlPlatformHeader instance using the specified properties.
             * @function create
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.IDataControlPlatformHeader=} [properties] Properties to set
             * @returns {ironcorelabs.proto.DataControlPlatformHeader} DataControlPlatformHeader instance
             */
            DataControlPlatformHeader.create = function create(properties) {
                return new DataControlPlatformHeader(properties);
            };

            /**
             * Encodes the specified DataControlPlatformHeader message. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.IDataControlPlatformHeader} message DataControlPlatformHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataControlPlatformHeader.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.documentId != null && Object.hasOwnProperty.call(message, "documentId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.documentId);
                if (message.segmentId != null && Object.hasOwnProperty.call(message, "segmentId"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.segmentId);
                return writer;
            };

            /**
             * Encodes the specified DataControlPlatformHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.IDataControlPlatformHeader} message DataControlPlatformHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataControlPlatformHeader.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.DataControlPlatformHeader} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataControlPlatformHeader.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ironcorelabs.proto.DataControlPlatformHeader();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.documentId = reader.string();
                            break;
                        }
                    case 2: {
                            message.segmentId = reader.uint64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.DataControlPlatformHeader} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataControlPlatformHeader.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DataControlPlatformHeader message.
             * @function verify
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DataControlPlatformHeader.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.documentId != null && message.hasOwnProperty("documentId"))
                    if (!$util.isString(message.documentId))
                        return "documentId: string expected";
                if (message.segmentId != null && message.hasOwnProperty("segmentId"))
                    if (!$util.isInteger(message.segmentId) && !(message.segmentId && $util.isInteger(message.segmentId.low) && $util.isInteger(message.segmentId.high)))
                        return "segmentId: integer|Long expected";
                return null;
            };

            /**
             * Creates a DataControlPlatformHeader message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ironcorelabs.proto.DataControlPlatformHeader} DataControlPlatformHeader
             */
            DataControlPlatformHeader.fromObject = function fromObject(object) {
                if (object instanceof $root.ironcorelabs.proto.DataControlPlatformHeader)
                    return object;
                var message = new $root.ironcorelabs.proto.DataControlPlatformHeader();
                if (object.documentId != null)
                    message.documentId = String(object.documentId);
                if (object.segmentId != null)
                    if ($util.Long)
                        (message.segmentId = $util.Long.fromValue(object.segmentId)).unsigned = true;
                    else if (typeof object.segmentId === "string")
                        message.segmentId = parseInt(object.segmentId, 10);
                    else if (typeof object.segmentId === "number")
                        message.segmentId = object.segmentId;
                    else if (typeof object.segmentId === "object")
                        message.segmentId = new $util.LongBits(object.segmentId.low >>> 0, object.segmentId.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a DataControlPlatformHeader message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.DataControlPlatformHeader} message DataControlPlatformHeader
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DataControlPlatformHeader.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.documentId = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.segmentId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.segmentId = options.longs === String ? "0" : 0;
                }
                if (message.documentId != null && message.hasOwnProperty("documentId"))
                    object.documentId = message.documentId;
                if (message.segmentId != null && message.hasOwnProperty("segmentId"))
                    if (typeof message.segmentId === "number")
                        object.segmentId = options.longs === String ? String(message.segmentId) : message.segmentId;
                    else
                        object.segmentId = options.longs === String ? $util.Long.prototype.toString.call(message.segmentId) : options.longs === Number ? new $util.LongBits(message.segmentId.low >>> 0, message.segmentId.high >>> 0).toNumber(true) : message.segmentId;
                return object;
            };

            /**
             * Converts this DataControlPlatformHeader to JSON.
             * @function toJSON
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DataControlPlatformHeader.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DataControlPlatformHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DataControlPlatformHeader.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ironcorelabs.proto.DataControlPlatformHeader";
            };

            return DataControlPlatformHeader;
        })();

        proto.SaaSShieldHeader = (function() {

            /**
             * Properties of a SaaSShieldHeader.
             * @memberof ironcorelabs.proto
             * @interface ISaaSShieldHeader
             * @property {string|null} [tenantId] SaaSShieldHeader tenantId
             */

            /**
             * Constructs a new SaaSShieldHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a SaaSShieldHeader.
             * @implements ISaaSShieldHeader
             * @constructor
             * @param {ironcorelabs.proto.ISaaSShieldHeader=} [properties] Properties to set
             */
            function SaaSShieldHeader(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SaaSShieldHeader tenantId.
             * @member {string} tenantId
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @instance
             */
            SaaSShieldHeader.prototype.tenantId = "";

            /**
             * Creates a new SaaSShieldHeader instance using the specified properties.
             * @function create
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.ISaaSShieldHeader=} [properties] Properties to set
             * @returns {ironcorelabs.proto.SaaSShieldHeader} SaaSShieldHeader instance
             */
            SaaSShieldHeader.create = function create(properties) {
                return new SaaSShieldHeader(properties);
            };

            /**
             * Encodes the specified SaaSShieldHeader message. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.ISaaSShieldHeader} message SaaSShieldHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SaaSShieldHeader.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tenantId != null && Object.hasOwnProperty.call(message, "tenantId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.tenantId);
                return writer;
            };

            /**
             * Encodes the specified SaaSShieldHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.ISaaSShieldHeader} message SaaSShieldHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SaaSShieldHeader.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.SaaSShieldHeader} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SaaSShieldHeader.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ironcorelabs.proto.SaaSShieldHeader();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.tenantId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.SaaSShieldHeader} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SaaSShieldHeader.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SaaSShieldHeader message.
             * @function verify
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SaaSShieldHeader.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tenantId != null && message.hasOwnProperty("tenantId"))
                    if (!$util.isString(message.tenantId))
                        return "tenantId: string expected";
                return null;
            };

            /**
             * Creates a SaaSShieldHeader message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ironcorelabs.proto.SaaSShieldHeader} SaaSShieldHeader
             */
            SaaSShieldHeader.fromObject = function fromObject(object) {
                if (object instanceof $root.ironcorelabs.proto.SaaSShieldHeader)
                    return object;
                var message = new $root.ironcorelabs.proto.SaaSShieldHeader();
                if (object.tenantId != null)
                    message.tenantId = String(object.tenantId);
                return message;
            };

            /**
             * Creates a plain object from a SaaSShieldHeader message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.SaaSShieldHeader} message SaaSShieldHeader
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SaaSShieldHeader.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.tenantId = "";
                if (message.tenantId != null && message.hasOwnProperty("tenantId"))
                    object.tenantId = message.tenantId;
                return object;
            };

            /**
             * Converts this SaaSShieldHeader to JSON.
             * @function toJSON
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SaaSShieldHeader.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for SaaSShieldHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            SaaSShieldHeader.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ironcorelabs.proto.SaaSShieldHeader";
            };

            return SaaSShieldHeader;
        })();

        proto.v3DocumentHeader = (function() {

            /**
             * Properties of a v3DocumentHeader.
             * @memberof ironcorelabs.proto
             * @interface Iv3DocumentHeader
             * @property {Uint8Array|null} [sig] v3DocumentHeader sig
             * @property {ironcorelabs.proto.IDataControlPlatformHeader|null} [dataControl] v3DocumentHeader dataControl
             * @property {ironcorelabs.proto.ISaaSShieldHeader|null} [saasShield] v3DocumentHeader saasShield
             */

            /**
             * Constructs a new v3DocumentHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a v3DocumentHeader.
             * @implements Iv3DocumentHeader
             * @constructor
             * @param {ironcorelabs.proto.Iv3DocumentHeader=} [properties] Properties to set
             */
            function v3DocumentHeader(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * v3DocumentHeader sig.
             * @member {Uint8Array} sig
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            v3DocumentHeader.prototype.sig = $util.newBuffer([]);

            /**
             * v3DocumentHeader dataControl.
             * @member {ironcorelabs.proto.IDataControlPlatformHeader|null|undefined} dataControl
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            v3DocumentHeader.prototype.dataControl = null;

            /**
             * v3DocumentHeader saasShield.
             * @member {ironcorelabs.proto.ISaaSShieldHeader|null|undefined} saasShield
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            v3DocumentHeader.prototype.saasShield = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * v3DocumentHeader header.
             * @member {"dataControl"|"saasShield"|undefined} header
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            Object.defineProperty(v3DocumentHeader.prototype, "header", {
                get: $util.oneOfGetter($oneOfFields = ["dataControl", "saasShield"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new v3DocumentHeader instance using the specified properties.
             * @function create
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.Iv3DocumentHeader=} [properties] Properties to set
             * @returns {ironcorelabs.proto.v3DocumentHeader} v3DocumentHeader instance
             */
            v3DocumentHeader.create = function create(properties) {
                return new v3DocumentHeader(properties);
            };

            /**
             * Encodes the specified v3DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.Iv3DocumentHeader} message v3DocumentHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            v3DocumentHeader.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.sig != null && Object.hasOwnProperty.call(message, "sig"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sig);
                if (message.dataControl != null && Object.hasOwnProperty.call(message, "dataControl"))
                    $root.ironcorelabs.proto.DataControlPlatformHeader.encode(message.dataControl, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.saasShield != null && Object.hasOwnProperty.call(message, "saasShield"))
                    $root.ironcorelabs.proto.SaaSShieldHeader.encode(message.saasShield, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified v3DocumentHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.Iv3DocumentHeader} message v3DocumentHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            v3DocumentHeader.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.v3DocumentHeader} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            v3DocumentHeader.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ironcorelabs.proto.v3DocumentHeader();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.sig = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.v3DocumentHeader} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            v3DocumentHeader.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a v3DocumentHeader message.
             * @function verify
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            v3DocumentHeader.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.sig != null && message.hasOwnProperty("sig"))
                    if (!(message.sig && typeof message.sig.length === "number" || $util.isString(message.sig)))
                        return "sig: buffer expected";
                if (message.dataControl != null && message.hasOwnProperty("dataControl")) {
                    properties.header = 1;
                    {
                        var error = $root.ironcorelabs.proto.DataControlPlatformHeader.verify(message.dataControl);
                        if (error)
                            return "dataControl." + error;
                    }
                }
                if (message.saasShield != null && message.hasOwnProperty("saasShield")) {
                    if (properties.header === 1)
                        return "header: multiple values";
                    properties.header = 1;
                    {
                        var error = $root.ironcorelabs.proto.SaaSShieldHeader.verify(message.saasShield);
                        if (error)
                            return "saasShield." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a v3DocumentHeader message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ironcorelabs.proto.v3DocumentHeader} v3DocumentHeader
             */
            v3DocumentHeader.fromObject = function fromObject(object) {
                if (object instanceof $root.ironcorelabs.proto.v3DocumentHeader)
                    return object;
                var message = new $root.ironcorelabs.proto.v3DocumentHeader();
                if (object.sig != null)
                    if (typeof object.sig === "string")
                        $util.base64.decode(object.sig, message.sig = $util.newBuffer($util.base64.length(object.sig)), 0);
                    else if (object.sig.length >= 0)
                        message.sig = object.sig;
                if (object.dataControl != null) {
                    if (typeof object.dataControl !== "object")
                        throw TypeError(".ironcorelabs.proto.v3DocumentHeader.dataControl: object expected");
                    message.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.fromObject(object.dataControl);
                }
                if (object.saasShield != null) {
                    if (typeof object.saasShield !== "object")
                        throw TypeError(".ironcorelabs.proto.v3DocumentHeader.saasShield: object expected");
                    message.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.fromObject(object.saasShield);
                }
                return message;
            };

            /**
             * Creates a plain object from a v3DocumentHeader message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.v3DocumentHeader} message v3DocumentHeader
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            v3DocumentHeader.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.sig = "";
                    else {
                        object.sig = [];
                        if (options.bytes !== Array)
                            object.sig = $util.newBuffer(object.sig);
                    }
                if (message.sig != null && message.hasOwnProperty("sig"))
                    object.sig = options.bytes === String ? $util.base64.encode(message.sig, 0, message.sig.length) : options.bytes === Array ? Array.prototype.slice.call(message.sig) : message.sig;
                if (message.dataControl != null && message.hasOwnProperty("dataControl")) {
                    object.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.toObject(message.dataControl, options);
                    if (options.oneofs)
                        object.header = "dataControl";
                }
                if (message.saasShield != null && message.hasOwnProperty("saasShield")) {
                    object.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.toObject(message.saasShield, options);
                    if (options.oneofs)
                        object.header = "saasShield";
                }
                return object;
            };

            /**
             * Converts this v3DocumentHeader to JSON.
             * @function toJSON
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            v3DocumentHeader.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for v3DocumentHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            v3DocumentHeader.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ironcorelabs.proto.v3DocumentHeader";
            };

            return v3DocumentHeader;
        })();

        return proto;
    })();

    return ironcorelabs;
})();

module.exports = $root;
