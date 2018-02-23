"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class LocalizationTransitionUpdate extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.roadPieceId = payload.readUInt8(2);
        this.prevRoadPieceId = payload.readUInt8(3);
        this.offsetFromRoadCenter = payload.readFloatLE(4);
        this.lastRecvLaneChangeCmdId = payload.readUInt8(8);
        this.lastExecLaneChangeCmdId = payload.readUInt8(9);
        this.lastDesiredLaneChangeSpeedMmPerSec = payload.readUInt16LE(10);
        this.haveFollowLineDriftPixels = payload.readUInt8(12);
        this.hadLaneChangeActivity = payload.readUInt8(13);
        this.uphillCounter = payload.readUInt8(14);
        this.downhillCounter = payload.readUInt8(15);
        this.leftWheelDistCm = payload.readUInt8(16);
        this.rightWheelDistCm = payload.readUInt8(17);
    }
}
exports.LocalizationTransitionUpdate = LocalizationTransitionUpdate;
