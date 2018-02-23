"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
class BatteryLevelRequest extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId) {
        super(vehicleId, Buffer.alloc(2));
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_BASE_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST, 1);
    }
}
exports.BatteryLevelRequest = BatteryLevelRequest;
