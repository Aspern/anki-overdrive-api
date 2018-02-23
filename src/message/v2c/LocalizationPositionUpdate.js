"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class LocalizationPositionUpdate extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.locationId = payload.readUInt8(2);
        this.roadPieceId = payload.readUInt8(3);
        this.offsetFromRoadCenter = payload.readFloatLE(4);
        this.speedMmPerSec = payload.readUInt16LE(8);
        this.parsingFlags = payload.readUInt8(10);
        this.lastRecvLaneChangeCmdId = payload.readUInt8(11);
        this.lastExecLaneChangeCmdId = payload.readUInt8(12);
        this.lastDesiredLaneChangeSpeedMmPerSec = payload.readUInt16LE(13);
        this.lastDesiredSpeedMmPerSec = payload.readUInt16LE(15);
    }
}
exports.LocalizationPositionUpdate = LocalizationPositionUpdate;
