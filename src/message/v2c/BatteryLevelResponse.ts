import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class BatteryLevelResponse extends AbstractVehicleMessage {

    public readonly batteryLevel: number

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)

        this.batteryLevel = payload.readUInt16LE(2)
    }

}

export {BatteryLevelResponse}