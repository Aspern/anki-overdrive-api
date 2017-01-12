"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vehicle_message_1 = require("./vehicle-message");
var PositionUpdateMessage = (function (_super) {
    __extends(PositionUpdateMessage, _super);
    function PositionUpdateMessage(data, vehicleId) {
        var _this = _super.call(this, data, vehicleId) || this;
        _this._location = data.readUInt8(2);
        _this._piece = data.readInt8(3);
        _this._offset = data.readFloatLE(4);
        _this._speed = data.readUInt16LE(8);
        _this._flags = data.readInt8(10);
        _this._lastLaneChangeCmd = data.readInt8(11);
        _this._lastExecLaneChangeCmd = data.readInt8(12);
        _this._lastDesiredHorizontalSpeed = data.readInt16LE(13);
        _this._lastDesiredSpeed = data.readInt16LE(15);
        return _this;
    }
    Object.defineProperty(PositionUpdateMessage.prototype, "location", {
        get: function () {
            return this._location;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "piece", {
        get: function () {
            return this._piece;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "offset", {
        get: function () {
            return this._offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "speed", {
        get: function () {
            return this._speed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "flags", {
        get: function () {
            return this._flags;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "lastLaneChangeCmd", {
        get: function () {
            return this._lastLaneChangeCmd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "lastExecLaneChangeCmd", {
        get: function () {
            return this._lastExecLaneChangeCmd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "lastDesiredHorizontalSpeed", {
        get: function () {
            return this._lastDesiredHorizontalSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PositionUpdateMessage.prototype, "lastDesiredSpeed", {
        get: function () {
            return this._lastDesiredSpeed;
        },
        enumerable: true,
        configurable: true
    });
    return PositionUpdateMessage;
}(vehicle_message_1.VehicleMessage));
exports.PositionUpdateMessage = PositionUpdateMessage;
//# sourceMappingURL=position-update-message.js.map