import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class LocalizationPositionUpdate extends AbstractVehicleMessage {

    public readonly locationId: number
    public readonly roadPieceId: number
    public readonly offsetFromRoadCenter: number
    public readonly speedMmPerSec: number
    public readonly parsingFlags: number
    public readonly lastRecvLaneChangeCmdId: number
    public readonly lastExecLaneChangeCmdId: number
    public readonly lastDesiredLaneChangeSpeedMmPerSec: number
    public readonly lastDesiredSpeedMmPerSec: number
    private distance: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.locationId = payload.readUInt8(2)
        this.roadPieceId = payload.readUInt8(3)
        this.offsetFromRoadCenter = payload.readFloatLE(4)
        this.speedMmPerSec = payload.readUInt16LE(8)
        this.parsingFlags = payload.readUInt8(10)
        this.lastRecvLaneChangeCmdId = payload.readUInt8(11)
        this.lastExecLaneChangeCmdId = payload.readUInt8(12)
        this.lastDesiredLaneChangeSpeedMmPerSec = payload.readUInt16LE(13)
        this.lastDesiredSpeedMmPerSec = payload.readUInt16LE(15)
    }

    public setDistance(distance: number): void {
        this.distance = distance
    }

}

export {LocalizationPositionUpdate}
