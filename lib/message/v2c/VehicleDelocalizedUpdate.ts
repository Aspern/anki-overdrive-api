import {AbstractVehicleMessage} from "../AbstractVehicleMessage"

class VehicleDelocalizedUpdate extends AbstractVehicleMessage {

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)
    }

}

export {VehicleDelocalizedUpdate}