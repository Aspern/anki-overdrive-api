import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class SetSpeed extends VehicleMessage {

    private _speed: number;
    private _acceleration: number;
    private _limit: boolean;

    constructor(vehicle: Vehicle, speed: number, acceleration = 250, limit = false) {
        super(new Buffer(7), vehicle, 0x24, 6);
        this.data.writeUInt16LE(speed, 2);
        this._speed = speed;
        this.data.writeUInt16LE(acceleration, 4);
        this._acceleration = acceleration;
        this.data.writeUInt8(limit ? 0x1 : 0x0, 6);
        this._limit = limit;
    }
}

export {SetSpeed}
