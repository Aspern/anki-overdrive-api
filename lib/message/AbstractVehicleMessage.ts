import {IVehicleMessage} from "./IVehicleMessage"

abstract class AbstractVehicleMessage implements IVehicleMessage {

    public readonly vehicleId: string;
    public readonly timestamp: Date;
    public readonly payload: Buffer;

    protected constructor(vehicleId: string, payload: Buffer) {
        this.vehicleId = vehicleId
        this.payload = payload
        this.timestamp = new Date()
    }

}

export {AbstractVehicleMessage}