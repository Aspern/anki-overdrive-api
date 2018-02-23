"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class VersionResponse extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.version = payload.readUInt16LE(2);
    }
}
exports.VersionResponse = VersionResponse;
