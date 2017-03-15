import {VehicleMessage} from "../vehicle-message";

class SetOffset extends VehicleMessage {

    constructor(vehicleId: string, offset: number) {
        super(new Buffer(6), vehicleId, 0x2c, 5);
        this.data.writeFloatLE(offset, 2);
    }
}

export {SetOffset}
