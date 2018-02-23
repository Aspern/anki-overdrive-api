"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
class PingRequest extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId) {
        super(vehicleId, Buffer.alloc(Protocol_1.ANKI_VEHICLE_MSG_BASE_SIZE + 1));
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_BASE_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_PING_REQUEST, 1);
    }
}
exports.PingRequest = PingRequest;
