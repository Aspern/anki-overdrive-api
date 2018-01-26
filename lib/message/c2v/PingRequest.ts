import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {ANKI_VEHICLE_MSG_BASE_SIZE, ANKI_VEHICLE_MSG_C2V_PING_REQUEST,} from "../Protocol"

class PingRequest extends AbstractVehicleMessage {

    public constructor(vehicleId: string) {
        super(vehicleId, new Buffer(2))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_BASE_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_PING_REQUEST, 1)
    }

}

export {PingRequest}