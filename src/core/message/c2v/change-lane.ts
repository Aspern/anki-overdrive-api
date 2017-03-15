import {VehicleMessage} from "../vehicle-message";

class ChangeLane extends VehicleMessage {

    constructor(vehicleId: string, offset: number, speed = 300, acceleration = 250, hopIntent = 0x0, tag = 0x0) {
        super(new Buffer(12), vehicleId, 0x25, 11);
        this.data.writeUInt16LE(speed, 2);
        this.data.writeUInt16LE(acceleration, 4);
        this.data.writeFloatLE(offset, 6);
        this.data.writeUInt8(hopIntent, 10);
        this.data.writeUInt8(tag, 11);
    }
}

export {ChangeLane}
