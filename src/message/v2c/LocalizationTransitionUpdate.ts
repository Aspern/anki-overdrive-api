import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class LocalizationTransitionUpdate extends AbstractVehicleMessage {

    public readonly roadPieceId: number
    public readonly prevRoadPieceId: number
    public readonly offsetFromRoadCenter: number
    public readonly lastRecvLaneChangeCmdId: number
    public readonly lastExecLaneChangeCmdId: number
    public readonly lastDesiredLaneChangeSpeedMmPerSec: number
    public readonly haveFollowLineDriftPixels: number
    public readonly hadLaneChangeActivity: number
    public readonly uphillCounter: number
    public readonly downhillCounter: number
    public readonly leftWheelDistCm: number
    public readonly rightWheelDistCm: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.roadPieceId = payload.readUInt8(2)
        this.prevRoadPieceId = payload.readUInt8(3)
        this.offsetFromRoadCenter = payload.readFloatLE(4)
        this.lastRecvLaneChangeCmdId = payload.readUInt8(8)
        this.lastExecLaneChangeCmdId = payload.readUInt8(9)
        this.lastDesiredLaneChangeSpeedMmPerSec = payload.readUInt16LE(10)
        this.haveFollowLineDriftPixels = payload.readUInt8(12)
        this.hadLaneChangeActivity = payload.readUInt8(13)
        this.uphillCounter = payload.readUInt8(14)
        this.downhillCounter = payload.readUInt8(15)
        this.leftWheelDistCm = payload.readUInt8(16)
        this.rightWheelDistCm = payload.readUInt8(17)
    }

}

export {LocalizationTransitionUpdate}