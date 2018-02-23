import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {ANKI_VEHICLE_MSG_C2V_SET_SPEED} from "../Protocol"

const ANKI_VEHICLE_MSG_C2V_SET_SPEED_SIZE   = 6

class SetSpeed extends AbstractVehicleMessage {

    public readonly speedMmPerSec: number
    public readonly accelMmPerSec2: number
    public readonly respectRoadPieceSpeedLimit: boolean

    public constructor(vehicleId: string,
                       speedMmPerSec: number,
                       accelMmPerSec2 = 500,
                       respectRoadPieceSpeedLimit = false) {
        super(vehicleId, Buffer.alloc(ANKI_VEHICLE_MSG_C2V_SET_SPEED_SIZE + 1))

        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_SPEED_SIZE, 0)
        this.payload.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_SPEED, 1)
        this.payload.writeUInt16LE(speedMmPerSec, 2)
        this.payload.writeUInt16LE(accelMmPerSec2, 4)
        this.payload.writeUInt8(respectRoadPieceSpeedLimit ? 1 : 0, 6)
        this.speedMmPerSec = speedMmPerSec
        this.accelMmPerSec2 = accelMmPerSec2
        this.respectRoadPieceSpeedLimit = respectRoadPieceSpeedLimit
    }

}

export {SetSpeed}