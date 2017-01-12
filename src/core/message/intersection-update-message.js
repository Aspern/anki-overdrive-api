"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vehicle_message_1 = require("./vehicle-message");
var IntersectionUpdateMessage = (function (_super) {
    __extends(IntersectionUpdateMessage, _super);
    function IntersectionUpdateMessage(data, vehicleId) {
        var _this = _super.call(this, data, vehicleId) || this;
        _this._piece = data.readInt8(2);
        _this._offset = data.readFloatLE(3);
        _this._direction = data.readInt8(7);
        _this._code = data.readInt8(8);
        _this._turn = data.readInt8(9);
        _this._exiting = data.readInt8(10) === 0x1;
        return _this;
    }
    Object.defineProperty(IntersectionUpdateMessage.prototype, "piece", {
        get: function () {
            return this._piece;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntersectionUpdateMessage.prototype, "offset", {
        get: function () {
            return this._offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntersectionUpdateMessage.prototype, "direction", {
        get: function () {
            return this._direction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntersectionUpdateMessage.prototype, "code", {
        get: function () {
            return this._code;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntersectionUpdateMessage.prototype, "turn", {
        get: function () {
            return this._turn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntersectionUpdateMessage.prototype, "exiting", {
        get: function () {
            return this._exiting;
        },
        enumerable: true,
        configurable: true
    });
    return IntersectionUpdateMessage;
}(vehicle_message_1.VehicleMessage));
exports.IntersectionUpdateMessage = IntersectionUpdateMessage;
//# sourceMappingURL=intersection-update-message.js.map