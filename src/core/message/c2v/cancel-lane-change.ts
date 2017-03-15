import {VehicleMessage} from "../vehicle-message";

class CancelLaneChange extends VehicleMessage {

    constructor(vehicleId: string) {
        super(new Buffer(2), vehicleId, 0x26, 1);
    }
}

export {CancelLaneChange}
