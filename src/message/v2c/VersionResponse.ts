import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class VersionResponse extends AbstractVehicleMessage {

    public readonly version: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.version = payload.readUInt16LE(2)
    }

}

export {VersionResponse}