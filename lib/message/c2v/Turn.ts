import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {ANKI_VEHICLE_MSG_C2V_TURN, TurnTrigger, TurnType} from "../Protocol"

const ANKI_VEHICLE_MSG_C2V_TURN_SIZE   = 3

class Turn extends AbstractVehicleMessage {

    public readonly type: TurnType
    public readonly trigger: TurnTrigger

    public constructor(vehicleId: string, type: TurnType, trigger = TurnTrigger.VEHICLE_TURN_TRIGGER_IMMEDIATE) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_C2V_TURN_SIZE + 1))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_TURN_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_TURN, 1)
        this.payload.writeUInt8(type, 2)
        this.payload.writeUInt8(trigger, 3)
        this.type = type
        this.trigger = trigger
    }

}

export {Turn}