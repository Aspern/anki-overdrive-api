import {AbstractVehicleMessage} from "../AbstractVehicleMessage";
import {ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER} from "../Protocol";

const ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE = 5

class SetOffsetFromRoadCenter extends  AbstractVehicleMessage {

    public readonly offsetMm: number

    public constructor(vehicleId: string, offsetMm: number) {
        super(vehicleId, new Buffer(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE + 1))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER, 1)
        this.payload.writeFloatLE(offsetMm, 2)
        this.offsetMm = offsetMm
    }

}

export {SetOffsetFromRoadCenter}