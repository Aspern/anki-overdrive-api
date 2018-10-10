import {IVehicleMessage} from "./IVehicleMessage"

abstract class AbstractVehicleMessage implements IVehicleMessage {

    public readonly vehicleId: string;
    public readonly timestamp: Date;
    public readonly payload: Buffer;
    public readonly name: string

    protected constructor(vehicleId: string, payload: Buffer) {
        this.vehicleId = vehicleId
        this.payload = payload
        this.timestamp = new Date()
        this.name = this.constructor.name
    }

    public toJsonString() {
        return JSON.stringify(
            this,
            (key, value) => key === 'payload' ? undefined : value
        )
    }
}

export {AbstractVehicleMessage}