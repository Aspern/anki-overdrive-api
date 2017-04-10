import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class VersionRequest extends VehicleMessage {

    constructor(vehicle: Vehicle) {
        super(new Buffer(2), vehicle, 0x18, 1);
    }
}

export {VersionRequest}
