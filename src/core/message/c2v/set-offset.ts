import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class SetOffset extends VehicleMessage {

    private _offset: number;

    constructor(vehicle: Vehicle, offset: number) {
        super(new Buffer(6), vehicle, 0x2c, 5);
        this.data.writeFloatLE(offset, 2);
        this._offset = offset;
    }
}

export {SetOffset}
