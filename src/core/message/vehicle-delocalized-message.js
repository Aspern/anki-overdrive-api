"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vehicle_message_1 = require("./vehicle-message");
var VehicleDelocalizedMessage = (function (_super) {
    __extends(VehicleDelocalizedMessage, _super);
    function VehicleDelocalizedMessage(data, vehicleId) {
        return _super.call(this, data, vehicleId) || this;
    }
    return VehicleDelocalizedMessage;
}(vehicle_message_1.VehicleMessage));
exports.VehicleDelocalizedMessage = VehicleDelocalizedMessage;
//# sourceMappingURL=vehicle-delocalized-message.js.map