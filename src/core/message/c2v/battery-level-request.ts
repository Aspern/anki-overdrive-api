import {VehicleMessage} from "../vehicle-message";

class BatteryLevelRequest extends VehicleMessage {

    constructor(vehicleId: string) {
        super(new Buffer(2), vehicleId, 0x1a, 1);
    }
}

export {BatteryLevelRequest}
