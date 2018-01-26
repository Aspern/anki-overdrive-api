import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {ANKI_VEHICLE_MSG_BASE_SIZE, ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST} from "../Protocol"

class VersionRequest extends AbstractVehicleMessage {

    public constructor(vehicleId: string) {
        super(vehicleId, new Buffer(2))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_BASE_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST, 1)
    }

}

export {VersionRequest}