import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class CancelLaneChange extends VehicleMessage {

    constructor(vehicle: Vehicle) {
        super(new Buffer(2), vehicle, 0x26, 1);
    }
}

export {CancelLaneChange}
