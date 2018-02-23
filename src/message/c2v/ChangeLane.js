"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
const ANKI_VEHICLE_MSG_C2V_CHANGE_LANE_SIZE = 11;
class ChangeLane extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, offsetFromRoadCenterMm, horizontalSpeedMmPerSec = 300, horizontalAccelMmPerSec2 = 300, hopIntent = 0x0, tag = 0x0) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE_SIZE + 1));
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_CHANGE_LANE, 1);
        this.payload.writeUInt16LE(horizontalSpeedMmPerSec, 2);
        this.payload.writeUInt16LE(horizontalAccelMmPerSec2, 4);
        this.payload.writeFloatLE(offsetFromRoadCenterMm, 6);
        this.payload.writeUInt8(hopIntent, 10);
        this.payload.writeUInt8(tag, 11);
        this.offsetFromRoadCenterMm = offsetFromRoadCenterMm;
        this.horizontalSpeedMmPerSec = horizontalSpeedMmPerSec;
        this.horizontalAccelMmPerSec2 = horizontalAccelMmPerSec2;
        this.hopIntent = hopIntent;
        this.tag = tag;
    }
}
exports.ChangeLane = ChangeLane;
