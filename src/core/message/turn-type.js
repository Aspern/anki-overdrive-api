"use strict";
var TurnType;
(function (TurnType) {
    TurnType[TurnType["VEHICLE_TURN_NONE"] = 0] = "VEHICLE_TURN_NONE";
    TurnType[TurnType["VEHICLE_TURN_LEFT"] = 1] = "VEHICLE_TURN_LEFT";
    TurnType[TurnType["VEHICLE_TURN_RIGHT"] = 2] = "VEHICLE_TURN_RIGHT";
    TurnType[TurnType["VEHICLE_TURN_UTURN"] = 3] = "VEHICLE_TURN_UTURN";
    TurnType[TurnType["VEHICLE_TURN_UTURN_JUMP"] = 4] = "VEHICLE_TURN_UTURN_JUMP";
})(TurnType || (TurnType = {}));
exports.TurnType = TurnType;
//# sourceMappingURL=turn-type.js.map