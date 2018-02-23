import {BatteryLevelResponse} from "./v2c/BatteryLevelResponse";
import {PingResponse} from "./v2c/PingResponse";
import {LocalizationTransitionUpdate} from "./v2c/LocalizationTransitionUpdate";
import {
    ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_PING_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED,
    ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
} from "./Protocol";
import {LocalizationIntersectionUpdate} from "./v2c/LocalizationIntersectionUpdate";
import {LocalizationPositionUpdate} from "./v2c/LocalizationPositionUpdate";
import {VersionResponse} from "./v2c/VersionResponse";
import {VehicleDelocalizedUpdate} from "./v2c/VehicleDelocalizedUpdate";
import {IVehicleMessage} from "./IVehicleMessage";

class MessageBuilder {

    private _messageId: number
    private _payload: Buffer
    private _vehicleId: string

    public messageId(id: number): MessageBuilder {
        this._messageId = id
        return this
    }

    public payload(payload: Buffer): MessageBuilder {
        this._payload = payload
        return this
    }

    public vehicleId(id: string): MessageBuilder {
        this._vehicleId = id
        return this
    }

    public build(): IVehicleMessage | undefined  {
        switch (this._messageId) {
            case ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE:
                return new BatteryLevelResponse(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE:
                return new LocalizationPositionUpdate(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE:
                return new LocalizationIntersectionUpdate(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE:
                return new LocalizationTransitionUpdate(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE:
                return new VersionResponse(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_PING_RESPONSE:
                return new PingResponse(this._vehicleId, this._payload)
            case ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED:
                return new VehicleDelocalizedUpdate(this._vehicleId, this._payload)
        }
    }

}

export {MessageBuilder}