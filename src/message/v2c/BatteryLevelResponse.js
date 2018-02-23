"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class BatteryLevelResponse extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.batteryLevel = payload.readUInt16LE(2);
    }
}
exports.BatteryLevelResponse = BatteryLevelResponse;
