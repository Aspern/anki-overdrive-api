"use strict";
var VehicleMessage = (function () {
    function VehicleMessage(data, vehicleId) {
        this._vehicleId = vehicleId;
        this._id = data.readInt8(1);
        this._timestamp = new Date();
    }
    Object.defineProperty(VehicleMessage.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleMessage.prototype, "vehicleId", {
        get: function () {
            return this._vehicleId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleMessage.prototype, "timestamp", {
        get: function () {
            return this._timestamp;
        },
        enumerable: true,
        configurable: true
    });
    return VehicleMessage;
}());
exports.VehicleMessage = VehicleMessage;
//# sourceMappingURL=vehicle-message.js.map