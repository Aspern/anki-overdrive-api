import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class OffsetFromRoadCenterUpdate extends AbstractVehicleMessage {

    public readonly offsetFromRoadCenter: number
    public readonly laneChangeId: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.offsetFromRoadCenter = payload.readFloatLE(2)
        this.laneChangeId = payload.readUInt8(6)
    }

}

export {OffsetFromRoadCenterUpdate}