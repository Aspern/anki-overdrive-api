"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vehicle_message_1 = require("./vehicle-message");
var TransitionUpdateMessage = (function (_super) {
    __extends(TransitionUpdateMessage, _super);
    function TransitionUpdateMessage(data, vehicleId) {
        var _this = _super.call(this, data, vehicleId) || this;
        _this._piece = data.readInt8(2);
        _this._previousPiece = data.readInt8(3);
        _this._offset = data.readFloatLE(4);
        _this._direction = data.readInt8(8);
        _this._lastLaneChangeCmd = data.readInt8(9);
        _this._lastExecLaneChangeCmd = data.readInt8(10);
        _this._lastDesiredHorizontalSpeed = data.readInt16LE(11);
        _this._lastDesiredSpeed = data.readInt16LE(13);
        _this._upHillCounter = data.readUInt8(15);
        _this._downHillCounter = data.readUInt8(16);
        _this._leftWheelDistance = data.readInt8(17);
        _this._rightWheelDistance = data.readUInt8(18);
        return _this;
    }
    Object.defineProperty(TransitionUpdateMessage.prototype, "piece", {
        get: function () {
            return this._piece;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "previousPiece", {
        get: function () {
            return this._previousPiece;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "offset", {
        get: function () {
            return this._offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "direction", {
        get: function () {
            return this._direction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "lastLaneChangeCmd", {
        get: function () {
            return this._lastLaneChangeCmd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "lastExecLaneChangeCmd", {
        get: function () {
            return this._lastExecLaneChangeCmd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "lastDesiredHorizontalSpeed", {
        get: function () {
            return this._lastDesiredHorizontalSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "lastDesiredSpeed", {
        get: function () {
            return this._lastDesiredSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "upHillCounter", {
        get: function () {
            return this._upHillCounter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "downHillCounter", {
        get: function () {
            return this._downHillCounter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "leftWheelDistance", {
        get: function () {
            return this._leftWheelDistance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransitionUpdateMessage.prototype, "rightWheelDistance", {
        get: function () {
            return this._rightWheelDistance;
        },
        enumerable: true,
        configurable: true
    });
    return TransitionUpdateMessage;
}(vehicle_message_1.VehicleMessage));
exports.TransitionUpdateMessage = TransitionUpdateMessage;
//# sourceMappingURL=transition-update-message.js.map