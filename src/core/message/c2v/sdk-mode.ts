import {VehicleMessage} from "../vehicle-message";

class SdkMode extends VehicleMessage {

    constructor(vehicleId: string, on: boolean, flags = 0x1) {
        super(new Buffer(4), vehicleId, 0x90, 3);
        this.data.writeUInt8(on ? 0x1 : 0x0, 2);
        this.data.writeUInt8(flags, 3);
    }
}

export {SdkMode}
