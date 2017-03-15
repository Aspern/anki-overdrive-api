import {VehicleMessage} from "../vehicle-message";

class PingRequest extends VehicleMessage {

    constructor(vehicleId: string) {
        super(new Buffer(2), vehicleId, 0x16, 1);
    }
}

export {PingRequest}
