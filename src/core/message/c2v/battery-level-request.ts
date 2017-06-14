import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class BatteryLevelRequest extends VehicleMessage {

    constructor(vehicle: Vehicle) {
        super(new Buffer(2), vehicle, 0x1a, 1);
    }
}

export {BatteryLevelRequest}
