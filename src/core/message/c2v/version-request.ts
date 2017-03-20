import {VehicleMessage} from "../vehicle-message";

class VersionRequest extends VehicleMessage {

    constructor(vehicleId: string) {
        super(new Buffer(2), vehicleId, 0x18, 1);
    }
}

export {VersionRequest}
