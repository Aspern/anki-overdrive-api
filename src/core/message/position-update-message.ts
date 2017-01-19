import {VehicleMessage} from "./vehicle-message";

/**
 * This message is sent by the vehicle when it has crossed a location.
 */
class PositionUpdateMessage extends VehicleMessage {

    private _location: number;
    private _piece: number;
    private _offset: number;
    private _speed: number;
    private _flags: number;
    private _lastLaneChangeCmd: number;
    private _lastExecLaneChangeCmd: number;
    private _lastDesiredHorizontalSpeed: number;
    private _lastDesiredSpeed: number;

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
        this._location = data.readUInt8(2);
        this._piece = data.readInt8(3);
        this._offset = data.readFloatLE(4);
        this._speed = data.readUInt16LE(8);
        this._flags = data.readInt8(10);
        this._lastLaneChangeCmd = data.readInt8(11);
        this._lastExecLaneChangeCmd = data.readInt8(12);
        this._lastDesiredHorizontalSpeed = data.readInt16LE(13);
        this._lastDesiredSpeed = data.readInt16LE(15);
    }

    get location(): number {
        return this._location;
    }

    get piece(): number {
        return this._piece;
    }

    get offset(): number {
        return this._offset;
    }

    get speed(): number {
        return this._speed;
    }

    get flags(): number {
        return this._flags;
    }

    get lastLaneChangeCmd(): number {
        return this._lastLaneChangeCmd;
    }

    get lastExecLaneChangeCmd(): number {
        return this._lastExecLaneChangeCmd;
    }

    get lastDesiredHorizontalSpeed(): number {
        return this._lastDesiredHorizontalSpeed;
    }

    get lastDesiredSpeed(): number {
        return this._lastDesiredSpeed;
    }
}

export {PositionUpdateMessage};