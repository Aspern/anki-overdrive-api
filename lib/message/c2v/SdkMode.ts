import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {ANKI_VEHICLE_MSG_C2V_SDK_MODE, ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION} from "../Protocol"

const ANKI_VEHICLE_MSG_SDK_MODE_SIZE = 3

class SdkMode extends AbstractVehicleMessage {

    public readonly on: boolean
    public readonly flags: number

    public constructor(vehicleId: string, on = true, flags = ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION) {
        super(vehicleId, new Buffer(ANKI_VEHICLE_MSG_SDK_MODE_SIZE + 1))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_SDK_MODE_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SDK_MODE, 1)
        this.payload.writeUInt8(on ? 1 : 0, 2)
        this.payload.writeUInt8(flags, 3)
        this.on = on
        this.flags = flags
    }

}

export {SdkMode}