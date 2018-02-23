"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
const ANKI_VEHICLE_MSG_SDK_MODE_SIZE = 3;
class SdkMode extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, on = true, flags = Protocol_1.ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_SDK_MODE_SIZE + 1));
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_SDK_MODE_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_SDK_MODE, 1);
        this.payload.writeUInt8(on ? 1 : 0, 2);
        this.payload.writeUInt8(flags, 3);
        this.on = on;
        this.flags = flags;
    }
}
exports.SdkMode = SdkMode;
