
import {VehicleMessage} from "./vehicle-message";
import {DrivingDirection} from "./driving-direction";
import {IntersectionCode} from "./intersection-code";

class VehicleDelocalizedMessage extends VehicleMessage {

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
    }

}

export {VehicleDelocalizedMessage};