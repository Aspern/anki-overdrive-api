"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
const ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE = 5;
class SetOffsetFromRoadCenter extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, offsetMm) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE + 1));
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER, 1);
        this.payload.writeFloatLE(offsetMm, 2);
        this.offsetMm = offsetMm;
    }
}
exports.SetOffsetFromRoadCenter = SetOffsetFromRoadCenter;
