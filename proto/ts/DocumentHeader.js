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

        proto.cmk = (function() {

            /**
             * Namespace cmk.
             * @memberof ironcorelabs.proto
             * @namespace
             */
            var cmk = {};

            cmk.DocumentHeader = (function() {

                /**
                 * Properties of a DocumentHeader.
                 * @memberof ironcorelabs.proto.cmk
                 * @interface IDocumentHeader
                 * @property {Uint8Array|null} [encryptedDekData] DocumentHeader encryptedDekData
                 */

                /**
                 * Constructs a new DocumentHeader.
                 * @memberof ironcorelabs.proto.cmk
                 * @classdesc Represents a DocumentHeader.
                 * @implements IDocumentHeader
                 * @constructor
                 * @param {ironcorelabs.proto.cmk.IDocumentHeader=} [properties] Properties to set
                 */
                function DocumentHeader(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DocumentHeader encryptedDekData.
                 * @member {Uint8Array} encryptedDekData
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @instance
                 */
                DocumentHeader.prototype.encryptedDekData = $util.newBuffer([]);

                /**
                 * Creates a new DocumentHeader instance using the specified properties.
                 * @function create
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {ironcorelabs.proto.cmk.IDocumentHeader=} [properties] Properties to set
                 * @returns {ironcorelabs.proto.cmk.DocumentHeader} DocumentHeader instance
                 */
                DocumentHeader.create = function create(properties) {
                    return new DocumentHeader(properties);
                };

                /**
                 * Encodes the specified DocumentHeader message. Does not implicitly {@link ironcorelabs.proto.cmk.DocumentHeader.verify|verify} messages.
                 * @function encode
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {ironcorelabs.proto.cmk.IDocumentHeader} message DocumentHeader message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DocumentHeader.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.encryptedDekData != null && Object.hasOwnProperty.call(message, "encryptedDekData"))
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.encryptedDekData);
                    return writer;
                };

                /**
                 * Decodes a DocumentHeader message from the specified reader or buffer.
                 * @function decode
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {ironcorelabs.proto.cmk.DocumentHeader} DocumentHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DocumentHeader.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ironcorelabs.proto.cmk.DocumentHeader();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.encryptedDekData = reader.bytes();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Verifies a DocumentHeader message.
                 * @function verify
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DocumentHeader.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.encryptedDekData != null && message.hasOwnProperty("encryptedDekData"))
                        if (!(message.encryptedDekData && typeof message.encryptedDekData.length === "number" || $util.isString(message.encryptedDekData)))
                            return "encryptedDekData: buffer expected";
                    return null;
                };

                /**
                 * Creates a DocumentHeader message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {ironcorelabs.proto.cmk.DocumentHeader} DocumentHeader
                 */
                DocumentHeader.fromObject = function fromObject(object) {
                    if (object instanceof $root.ironcorelabs.proto.cmk.DocumentHeader)
                        return object;
                    var message = new $root.ironcorelabs.proto.cmk.DocumentHeader();
                    if (object.encryptedDekData != null)
                        if (typeof object.encryptedDekData === "string")
                            $util.base64.decode(object.encryptedDekData, message.encryptedDekData = $util.newBuffer($util.base64.length(object.encryptedDekData)), 0);
                        else if (object.encryptedDekData.length)
                            message.encryptedDekData = object.encryptedDekData;
                    return message;
                };

                /**
                 * Creates a plain object from a DocumentHeader message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @static
                 * @param {ironcorelabs.proto.cmk.DocumentHeader} message DocumentHeader
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DocumentHeader.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        if (options.bytes === String)
                            object.encryptedDekData = "";
                        else {
                            object.encryptedDekData = [];
                            if (options.bytes !== Array)
                                object.encryptedDekData = $util.newBuffer(object.encryptedDekData);
                        }
                    if (message.encryptedDekData != null && message.hasOwnProperty("encryptedDekData"))
                        object.encryptedDekData = options.bytes === String ? $util.base64.encode(message.encryptedDekData, 0, message.encryptedDekData.length) : options.bytes === Array ? Array.prototype.slice.call(message.encryptedDekData) : message.encryptedDekData;
                    return object;
                };

                /**
                 * Converts this DocumentHeader to JSON.
                 * @function toJSON
                 * @memberof ironcorelabs.proto.cmk.DocumentHeader
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DocumentHeader.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DocumentHeader;
            })();

            return cmk;
        })();

        return proto;
    })();

    return ironcorelabs;
})();

module.exports = $root;
