"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class OffsetFromRoadCenterUpdate extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.offsetFromRoadCenter = payload.readFloatLE(2);
        this.laneChangeId = payload.readUInt8(6);
    }
}
exports.OffsetFromRoadCenterUpdate = OffsetFromRoadCenterUpdate;
