import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class PingRequest extends VehicleMessage {

    constructor(vehicle: Vehicle) {
        super(new Buffer(2), vehicle, 0x16, 1);
    }
}

export {PingRequest}
