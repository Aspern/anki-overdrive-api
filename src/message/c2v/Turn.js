"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
const Protocol_1 = require("../Protocol");
const ANKI_VEHICLE_MSG_C2V_TURN_SIZE = 3;
var TurnTrigger;
(function (TurnTrigger) {
    TurnTrigger[TurnTrigger["VEHICLE_TURN_TRIGGER_IMMEDIATE"] = 0] = "VEHICLE_TURN_TRIGGER_IMMEDIATE";
    TurnTrigger[TurnTrigger["VEHICLE_TURN_TRIGGER_INTERSECTION"] = 1] = "VEHICLE_TURN_TRIGGER_INTERSECTION";
})(TurnTrigger || (TurnTrigger = {}));
exports.TurnTrigger = TurnTrigger;
var TurnType;
(function (TurnType) {
    TurnType[TurnType["VEHICLE_TURN_NONE"] = 0] = "VEHICLE_TURN_NONE";
    TurnType[TurnType["VEHICLE_TURN_LEFT"] = 1] = "VEHICLE_TURN_LEFT";
    TurnType[TurnType["VEHICLE_TURN_RIGHT"] = 2] = "VEHICLE_TURN_RIGHT";
    TurnType[TurnType["VEHICLE_TURN_UTURN"] = 3] = "VEHICLE_TURN_UTURN";
    TurnType[TurnType["VEHICLE_TURN_UTURN_JUMP"] = 4] = "VEHICLE_TURN_UTURN_JUMP";
})(TurnType || (TurnType = {}));
exports.TurnType = TurnType;
class Turn extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, type, trigger = TurnTrigger.VEHICLE_TURN_TRIGGER_IMMEDIATE) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_C2V_TURN_SIZE + 1));
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_TURN_SIZE, 0);
        this.payload.writeUInt8(Protocol_1.ANKI_VEHICLE_MSG_C2V_TURN, 1);
        this.payload.writeUInt8(type, 2);
        this.payload.writeUInt8(trigger, 3);
        this.type = type;
        this.trigger = trigger;
    }
}
exports.Turn = Turn;
