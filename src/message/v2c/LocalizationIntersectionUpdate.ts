import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class LocalizationIntersectionUpdate extends AbstractVehicleMessage {

    public readonly roadPieceId: number
    public readonly offsetFromRoadCenter: number
    public readonly intersectionCode: number
    public readonly isExisting: number
    public readonly mmSinceLastTransitionBar: number
    public readonly mmSinceLastIntersectionCode: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.roadPieceId = payload.readUInt8(2)
        this.offsetFromRoadCenter = payload.readFloatLE(3)
        this.intersectionCode = payload.readUInt8(7)
        this.isExisting = payload.readUInt8(8)
        this.mmSinceLastTransitionBar = payload.readUInt16LE(9)
        this.mmSinceLastIntersectionCode = payload.readUInt16LE(11)
    }

}

export {LocalizationIntersectionUpdate}