/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
var $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $TypeError = $util.global.TypeError, $String = $util.global.String, $Number = $util.global.Number, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt, $Array = $util.global.Array;

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
             * @typedef {Object} ironcorelabs.proto.DataControlPlatformHeader.$Properties
             * @property {string|null} [documentId] DataControlPlatformHeader documentId
             * @property {number|Long|null} [segmentId] DataControlPlatformHeader segmentId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a DataControlPlatformHeader.
             * @memberof ironcorelabs.proto
             * @interface IDataControlPlatformHeader
             * @augments ironcorelabs.proto.DataControlPlatformHeader.$Properties
             * @deprecated Use ironcorelabs.proto.DataControlPlatformHeader.$Properties instead.
             */

            /**
             * Shape of a DataControlPlatformHeader.
             * @typedef {ironcorelabs.proto.DataControlPlatformHeader.$Properties} ironcorelabs.proto.DataControlPlatformHeader.$Shape
             */

            /**
             * Constructs a new DataControlPlatformHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a DataControlPlatformHeader.
             * @constructor
             * @param {ironcorelabs.proto.DataControlPlatformHeader.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            var DataControlPlatformHeader = function (properties) {
                if (properties)
                    for (var keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {ironcorelabs.proto.DataControlPlatformHeader.$Properties=} [properties] Properties to set
             * @returns {ironcorelabs.proto.DataControlPlatformHeader} DataControlPlatformHeader instance
             * @type {{
             *   (properties: ironcorelabs.proto.DataControlPlatformHeader.$Shape): ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape;
             *   (properties?: ironcorelabs.proto.DataControlPlatformHeader.$Properties): ironcorelabs.proto.DataControlPlatformHeader;
             * }}
             */
            DataControlPlatformHeader.create = function(properties) {
                return new DataControlPlatformHeader(properties);
            };

            /**
             * Encodes the specified DataControlPlatformHeader message. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.DataControlPlatformHeader.$Properties} message DataControlPlatformHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataControlPlatformHeader.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId") && message.documentId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.documentId);
                if (message.segmentId != null && $Object.hasOwnProperty.call(message, "segmentId") && (typeof message.segmentId === "object" ? message.segmentId.low || message.segmentId.high : message.segmentId !== 0))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.segmentId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (var i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified DataControlPlatformHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.DataControlPlatformHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {ironcorelabs.proto.DataControlPlatformHeader.$Properties} message DataControlPlatformHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataControlPlatformHeader.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataControlPlatformHeader.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                var end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ironcorelabs.proto.DataControlPlatformHeader(), value;
                while (reader.pos < end) {
                    var start = reader.pos;
                    var tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    var wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.documentId = value;
                            else
                                delete message.documentId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.segmentId = value;
                            else
                                delete message.segmentId;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a DataControlPlatformHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.DataControlPlatformHeader & ironcorelabs.proto.DataControlPlatformHeader.$Shape} DataControlPlatformHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataControlPlatformHeader.decodeDelimited = function(reader) {
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
            DataControlPlatformHeader.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    if (!$util.isString(message.documentId))
                        return "documentId: string expected";
                if (message.segmentId != null && $Object.hasOwnProperty.call(message, "segmentId"))
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
            DataControlPlatformHeader.fromObject = function (object, _depth) {
                if (object instanceof $root.ironcorelabs.proto.DataControlPlatformHeader)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".ironcorelabs.proto.DataControlPlatformHeader: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var message = new $root.ironcorelabs.proto.DataControlPlatformHeader();
                if (object.documentId != null)
                    if (typeof object.documentId !== "string" || object.documentId.length)
                        message.documentId = $String(object.documentId);
                if (object.segmentId != null)
                    if (typeof object.segmentId === "object" ? object.segmentId.low || object.segmentId.high : $Number(object.segmentId) !== 0)
                        if ($util.Long)
                            message.segmentId = $util.Long.fromValue(object.segmentId, true);
                        else if (typeof object.segmentId === "string")
                            message.segmentId = $parseInt(object.segmentId, 10);
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
            DataControlPlatformHeader.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var object = {};
                if (options.defaults) {
                    object.documentId = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.segmentId = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.segmentId = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    object.documentId = message.documentId;
                if (message.segmentId != null && $Object.hasOwnProperty.call(message, "segmentId"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.segmentId = typeof message.segmentId === "number" ? $BigInt(message.segmentId) : $util.Long.fromBits(message.segmentId.low >>> 0, message.segmentId.high >>> 0, true).toBigInt();
                    else if (typeof message.segmentId === "number")
                        object.segmentId = options.longs === $String ? $String(message.segmentId) : message.segmentId;
                    else
                        object.segmentId = options.longs === $String ? $util.Long.prototype.toString.call(message.segmentId) : options.longs === $Number ? new $util.LongBits(message.segmentId.low >>> 0, message.segmentId.high >>> 0).toNumber(true) : message.segmentId;
                return object;
            };

            /**
             * Converts this DataControlPlatformHeader to JSON.
             * @function toJSON
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DataControlPlatformHeader.prototype.toJSON = function() {
                return DataControlPlatformHeader.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for DataControlPlatformHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.DataControlPlatformHeader
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            DataControlPlatformHeader.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/ironcorelabs.proto.DataControlPlatformHeader";
            };

            return DataControlPlatformHeader;
        })();

        proto.SaaSShieldHeader = (function() {

            /**
             * Properties of a SaaSShieldHeader.
             * @typedef {Object} ironcorelabs.proto.SaaSShieldHeader.$Properties
             * @property {string|null} [tenantId] SaaSShieldHeader tenantId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SaaSShieldHeader.
             * @memberof ironcorelabs.proto
             * @interface ISaaSShieldHeader
             * @augments ironcorelabs.proto.SaaSShieldHeader.$Properties
             * @deprecated Use ironcorelabs.proto.SaaSShieldHeader.$Properties instead.
             */

            /**
             * Shape of a SaaSShieldHeader.
             * @typedef {ironcorelabs.proto.SaaSShieldHeader.$Properties} ironcorelabs.proto.SaaSShieldHeader.$Shape
             */

            /**
             * Constructs a new SaaSShieldHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a SaaSShieldHeader.
             * @constructor
             * @param {ironcorelabs.proto.SaaSShieldHeader.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            var SaaSShieldHeader = function (properties) {
                if (properties)
                    for (var keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
             * @param {ironcorelabs.proto.SaaSShieldHeader.$Properties=} [properties] Properties to set
             * @returns {ironcorelabs.proto.SaaSShieldHeader} SaaSShieldHeader instance
             * @type {{
             *   (properties: ironcorelabs.proto.SaaSShieldHeader.$Shape): ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape;
             *   (properties?: ironcorelabs.proto.SaaSShieldHeader.$Properties): ironcorelabs.proto.SaaSShieldHeader;
             * }}
             */
            SaaSShieldHeader.create = function(properties) {
                return new SaaSShieldHeader(properties);
            };

            /**
             * Encodes the specified SaaSShieldHeader message. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.SaaSShieldHeader.$Properties} message SaaSShieldHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SaaSShieldHeader.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.tenantId != null && $Object.hasOwnProperty.call(message, "tenantId") && message.tenantId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.tenantId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (var i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified SaaSShieldHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.SaaSShieldHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {ironcorelabs.proto.SaaSShieldHeader.$Properties} message SaaSShieldHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SaaSShieldHeader.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SaaSShieldHeader.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                var end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ironcorelabs.proto.SaaSShieldHeader(), value;
                while (reader.pos < end) {
                    var start = reader.pos;
                    var tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    var wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.tenantId = value;
                            else
                                delete message.tenantId;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a SaaSShieldHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.SaaSShieldHeader & ironcorelabs.proto.SaaSShieldHeader.$Shape} SaaSShieldHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SaaSShieldHeader.decodeDelimited = function(reader) {
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
            SaaSShieldHeader.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.tenantId != null && $Object.hasOwnProperty.call(message, "tenantId"))
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
            SaaSShieldHeader.fromObject = function (object, _depth) {
                if (object instanceof $root.ironcorelabs.proto.SaaSShieldHeader)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".ironcorelabs.proto.SaaSShieldHeader: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var message = new $root.ironcorelabs.proto.SaaSShieldHeader();
                if (object.tenantId != null)
                    if (typeof object.tenantId !== "string" || object.tenantId.length)
                        message.tenantId = $String(object.tenantId);
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
            SaaSShieldHeader.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var object = {};
                if (options.defaults)
                    object.tenantId = "";
                if (message.tenantId != null && $Object.hasOwnProperty.call(message, "tenantId"))
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
            SaaSShieldHeader.prototype.toJSON = function() {
                return SaaSShieldHeader.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for SaaSShieldHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.SaaSShieldHeader
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SaaSShieldHeader.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/ironcorelabs.proto.SaaSShieldHeader";
            };

            return SaaSShieldHeader;
        })();

        proto.v3DocumentHeader = (function() {

            /**
             * Properties of a v3DocumentHeader.
             * @typedef {Object} ironcorelabs.proto.v3DocumentHeader.$Properties
             * @property {Uint8Array|null} [sig] v3DocumentHeader sig
             * @property {ironcorelabs.proto.DataControlPlatformHeader.$Properties|null} [dataControl] v3DocumentHeader dataControl
             * @property {ironcorelabs.proto.SaaSShieldHeader.$Properties|null} [saasShield] v3DocumentHeader saasShield
             * @property {"dataControl"|"saasShield"} [header] v3DocumentHeader header
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a v3DocumentHeader.
             * @memberof ironcorelabs.proto
             * @interface Iv3DocumentHeader
             * @augments ironcorelabs.proto.v3DocumentHeader.$Properties
             * @deprecated Use ironcorelabs.proto.v3DocumentHeader.$Properties instead.
             */

            /**
             * Narrowed shape of a v3DocumentHeader.
             * @typedef {{
             *   sig?: Uint8Array|null;
             *   dataControl?: ironcorelabs.proto.DataControlPlatformHeader.$Shape|null;
             *   saasShield?: ironcorelabs.proto.SaaSShieldHeader.$Shape|null;
             *   $unknowns?: Array.<Uint8Array>;
             * } & (
             *   ({ header?: undefined; dataControl?: null; saasShield?: null }|{ header?: "dataControl"; dataControl: ironcorelabs.proto.DataControlPlatformHeader.$Shape; saasShield?: null }|{ header?: "saasShield"; dataControl?: null; saasShield: ironcorelabs.proto.SaaSShieldHeader.$Shape })
             * )} ironcorelabs.proto.v3DocumentHeader.$Shape
             */

            /**
             * Constructs a new v3DocumentHeader.
             * @memberof ironcorelabs.proto
             * @classdesc Represents a v3DocumentHeader.
             * @constructor
             * @param {ironcorelabs.proto.v3DocumentHeader.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            var v3DocumentHeader = function (properties) {
                if (properties)
                    for (var keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * v3DocumentHeader sig.
             * @member {Uint8Array} sig
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            v3DocumentHeader.prototype.sig = $util.newBuffer([]);

            /**
             * v3DocumentHeader dataControl.
             * @member {ironcorelabs.proto.DataControlPlatformHeader.$Properties|null|undefined} dataControl
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @instance
             */
            v3DocumentHeader.prototype.dataControl = null;

            /**
             * v3DocumentHeader saasShield.
             * @member {ironcorelabs.proto.SaaSShieldHeader.$Properties|null|undefined} saasShield
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
            $Object.defineProperty(v3DocumentHeader.prototype, "header", {
                get: $util.oneOfGetter($oneOfFields = ["dataControl", "saasShield"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new v3DocumentHeader instance using the specified properties.
             * @function create
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.v3DocumentHeader.$Properties=} [properties] Properties to set
             * @returns {ironcorelabs.proto.v3DocumentHeader} v3DocumentHeader instance
             * @type {{
             *   (properties: ironcorelabs.proto.v3DocumentHeader.$Shape): ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape;
             *   (properties?: ironcorelabs.proto.v3DocumentHeader.$Properties): ironcorelabs.proto.v3DocumentHeader;
             * }}
             */
            v3DocumentHeader.create = function(properties) {
                return new v3DocumentHeader(properties);
            };

            /**
             * Encodes the specified v3DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @function encode
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.v3DocumentHeader.$Properties} message v3DocumentHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            v3DocumentHeader.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sig != null && $Object.hasOwnProperty.call(message, "sig") && message.sig.length)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sig);
                if (message.dataControl != null && $Object.hasOwnProperty.call(message, "dataControl"))
                    $root.ironcorelabs.proto.DataControlPlatformHeader.encode(message.dataControl, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.saasShield != null && $Object.hasOwnProperty.call(message, "saasShield"))
                    $root.ironcorelabs.proto.SaaSShieldHeader.encode(message.saasShield, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (var i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified v3DocumentHeader message, length delimited. Does not implicitly {@link ironcorelabs.proto.v3DocumentHeader.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {ironcorelabs.proto.v3DocumentHeader.$Properties} message v3DocumentHeader message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            v3DocumentHeader.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer.
             * @function decode
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            v3DocumentHeader.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                var end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.ironcorelabs.proto.v3DocumentHeader(), value;
                while (reader.pos < end) {
                    var start = reader.pos;
                    var tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    var wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.sig = value;
                            else
                                delete message.sig;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.decode(reader, reader.uint32(), $undefined, _depth + 1, message.dataControl);
                            message.header = "dataControl";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.decode(reader, reader.uint32(), $undefined, _depth + 1, message.saasShield);
                            message.header = "saasShield";
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a v3DocumentHeader message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ironcorelabs.proto.v3DocumentHeader & ironcorelabs.proto.v3DocumentHeader.$Shape} v3DocumentHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            v3DocumentHeader.decodeDelimited = function(reader) {
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
            v3DocumentHeader.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                var properties = {};
                if (message.sig != null && $Object.hasOwnProperty.call(message, "sig"))
                    if (!(message.sig && typeof message.sig.length === "number" || $util.isString(message.sig)))
                        return "sig: buffer expected";
                if (message.dataControl != null && $Object.hasOwnProperty.call(message, "dataControl")) {
                    properties.header = 1;
                    {
                        var error = $root.ironcorelabs.proto.DataControlPlatformHeader.verify(message.dataControl, _depth + 1);
                        if (error)
                            return "dataControl." + error;
                    }
                }
                if (message.saasShield != null && $Object.hasOwnProperty.call(message, "saasShield")) {
                    if (properties.header === 1)
                        return "header: multiple values";
                    properties.header = 1;
                    {
                        var error = $root.ironcorelabs.proto.SaaSShieldHeader.verify(message.saasShield, _depth + 1);
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
            v3DocumentHeader.fromObject = function (object, _depth) {
                if (object instanceof $root.ironcorelabs.proto.v3DocumentHeader)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".ironcorelabs.proto.v3DocumentHeader: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var message = new $root.ironcorelabs.proto.v3DocumentHeader();
                if (object.sig != null)
                    if (object.sig.length)
                        if (typeof object.sig === "string")
                            $util.base64.decode(object.sig, message.sig = $util.newBuffer($util.base64.length(object.sig)), 0);
                        else if (object.sig.length >= 0)
                            message.sig = object.sig;
                if (object.dataControl != null) {
                    if (!$util.isObject(object.dataControl))
                        throw $TypeError(".ironcorelabs.proto.v3DocumentHeader.dataControl: object expected");
                    message.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.fromObject(object.dataControl, _depth + 1);
                }
                if (object.saasShield != null) {
                    if (!$util.isObject(object.saasShield))
                        throw $TypeError(".ironcorelabs.proto.v3DocumentHeader.saasShield: object expected");
                    message.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.fromObject(object.saasShield, _depth + 1);
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
            v3DocumentHeader.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                var object = {};
                if (options.defaults)
                    if (options.bytes === $String)
                        object.sig = "";
                    else {
                        object.sig = [];
                        if (options.bytes !== $Array)
                            object.sig = $util.newBuffer(object.sig);
                    }
                if (message.sig != null && $Object.hasOwnProperty.call(message, "sig"))
                    object.sig = options.bytes === $String ? $util.base64.encode(message.sig, 0, message.sig.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.sig) : message.sig;
                if (message.dataControl != null && $Object.hasOwnProperty.call(message, "dataControl")) {
                    object.dataControl = $root.ironcorelabs.proto.DataControlPlatformHeader.toObject(message.dataControl, options, _depth + 1);
                    if (options.oneofs)
                        object.header = "dataControl";
                }
                if (message.saasShield != null && $Object.hasOwnProperty.call(message, "saasShield")) {
                    object.saasShield = $root.ironcorelabs.proto.SaaSShieldHeader.toObject(message.saasShield, options, _depth + 1);
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
            v3DocumentHeader.prototype.toJSON = function() {
                return v3DocumentHeader.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for v3DocumentHeader
             * @function getTypeUrl
             * @memberof ironcorelabs.proto.v3DocumentHeader
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            v3DocumentHeader.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/ironcorelabs.proto.v3DocumentHeader";
            };

            return v3DocumentHeader;
        })();

        return proto;
    })();

    return ironcorelabs;
})();

module.exports = $root;
