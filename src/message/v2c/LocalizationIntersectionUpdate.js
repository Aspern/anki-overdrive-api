"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class LocalizationIntersectionUpdate extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
        this.roadPieceId = payload.readUInt8(2);
        this.offsetFromRoadCenter = payload.readFloatLE(3);
        this.intersectionCode = payload.readUInt8(7);
        this.isExisting = payload.readUInt8(8);
        this.mmSinceLastTransitionBar = payload.readUInt16LE(9);
        this.mmSinceLastIntersectionCode = payload.readUInt16LE(11);
    }
}
exports.LocalizationIntersectionUpdate = LocalizationIntersectionUpdate;
