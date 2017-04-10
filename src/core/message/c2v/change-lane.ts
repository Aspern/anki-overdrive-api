import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class ChangeLane extends VehicleMessage {

    private _horizontalSpeed: number;
    private _horizontalAcceleration: number;
    private _hopIntent: number;
    private _tag: number;
    private _offset: number;

    constructor(vehicle: Vehicle, offset: number, speed = 300, acceleration = 250, hopIntent = 0x0, tag = 0x0) {
        super(new Buffer(12), vehicle, 0x25, 11);
        this.data.writeUInt16LE(speed, 2);
        this._horizontalSpeed = speed;
        this.data.writeUInt16LE(acceleration, 4);
        this._horizontalAcceleration = acceleration;
        this.data.writeFloatLE(offset, 6);
        this._offset = offset;
        this.data.writeUInt8(hopIntent, 10);
        this._hopIntent = hopIntent;
        this.data.writeUInt8(tag, 11);
        this._tag = tag;
    }
}

export {ChangeLane}
