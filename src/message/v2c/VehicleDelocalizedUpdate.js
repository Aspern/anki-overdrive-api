"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class VehicleDelocalizedUpdate extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
    }
}
exports.VehicleDelocalizedUpdate = VehicleDelocalizedUpdate;
