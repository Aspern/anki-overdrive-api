import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class SdkMode extends VehicleMessage {

    private _on : boolean;
    private _flags: number;

    constructor(vehicle: Vehicle, on: boolean, flags = 0x1) {
        super(new Buffer(4), vehicle, 0x90, 3);
        this.data.writeUInt8(on ? 0x1 : 0x0, 2);
        this._on = on;
        this.data.writeUInt8(flags, 3);
        this._flags = flags;
    }
}

export {SdkMode}
