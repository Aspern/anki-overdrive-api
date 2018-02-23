"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BatteryLevelResponse_1 = require("./v2c/BatteryLevelResponse");
const PingResponse_1 = require("./v2c/PingResponse");
const LocalizationTransitionUpdate_1 = require("./v2c/LocalizationTransitionUpdate");
const Protocol_1 = require("./Protocol");
const LocalizationIntersectionUpdate_1 = require("./v2c/LocalizationIntersectionUpdate");
const LocalizationPositionUpdate_1 = require("./v2c/LocalizationPositionUpdate");
const VersionResponse_1 = require("./v2c/VersionResponse");
const VehicleDelocalizedUpdate_1 = require("./v2c/VehicleDelocalizedUpdate");
class MessageBuilder {
    messageId(id) {
        this._messageId = id;
        return this;
    }
    payload(payload) {
        this._payload = payload;
        return this;
    }
    vehicleId(id) {
        this._vehicleId = id;
        return this;
    }
    build() {
        switch (this._messageId) {
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE:
                return new BatteryLevelResponse_1.BatteryLevelResponse(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE:
                return new LocalizationPositionUpdate_1.LocalizationPositionUpdate(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE:
                return new LocalizationIntersectionUpdate_1.LocalizationIntersectionUpdate(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE:
                return new LocalizationTransitionUpdate_1.LocalizationTransitionUpdate(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE:
                return new VersionResponse_1.VersionResponse(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_PING_RESPONSE:
                return new PingResponse_1.PingResponse(this._vehicleId, this._payload);
            case Protocol_1.ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED:
                return new VehicleDelocalizedUpdate_1.VehicleDelocalizedUpdate(this._vehicleId, this._payload);
        }
    }
}
exports.MessageBuilder = MessageBuilder;
