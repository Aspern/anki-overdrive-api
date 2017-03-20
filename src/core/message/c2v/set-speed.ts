import {VehicleMessage} from "../vehicle-message";

class SetSpeed extends VehicleMessage {

    private _speed: number;
    private _acceleration: number;
    private _limit: boolean;

    constructor(vehicleId: string, speed: number, acceleration = 250, limit = false) {
        super(new Buffer(7), vehicleId, 0x24, 6);
        this.data.writeUInt16LE(speed, 2);
        this._speed = speed;
        this.data.writeUInt16LE(acceleration, 4);
        this._acceleration = acceleration;
        this.data.writeUInt8(limit ? 0x1 : 0x0, 6);
        this._limit = limit;
    }
}

export {SetSpeed}
