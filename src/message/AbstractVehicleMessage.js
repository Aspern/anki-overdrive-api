"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        this.vehicleId = vehicleId;
        this.payload = payload;
        this.timestamp = new Date();
    }
}
exports.AbstractVehicleMessage = AbstractVehicleMessage;
