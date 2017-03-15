import {VehicleMessage} from "../vehicle-message";
import {DrivingDirection} from "../driving-direction";

/**
 * This message is sent by the vehicle when it has crossed a piece.
 */
class TransitionUpdateMessage extends VehicleMessage {

    private _piece: number;
    private _previousPiece: number;
    private _offset: number;
    private _direction: DrivingDirection;
    private _lastLaneChangeCmd: number;
    private _lastExecLaneChangeCmd: number;
    private _lastDesiredHorizontalSpeed: number;
    private _lastDesiredSpeed: number;
    private _upHillCounter: number;
    private _downHillCounter: number;
    private _leftWheelDistance: number;
    private _rightWheelDistance: number;

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
        this._piece = data.readInt8(2);
        this._previousPiece = data.readInt8(3);
        this._offset = data.readFloatLE(4);
        this._direction = data.readInt8(8);
        this._lastLaneChangeCmd = data.readInt8(9);
        this._lastExecLaneChangeCmd = data.readInt8(10);
        this._lastDesiredHorizontalSpeed = data.readInt16LE(11);
        this._lastDesiredSpeed = data.readInt16LE(13);
        this._upHillCounter = data.readUInt8(15);
        this._downHillCounter = data.readUInt8(16);
        this._leftWheelDistance = data.readInt8(17);
        //this._rightWheelDistance = data.readUInt8(18);
    }


    get piece(): number {
        return this._piece;
    }

    get previousPiece(): number {
        return this._previousPiece;
    }

    get offset(): number {
        return this._offset;
    }

    get direction(): DrivingDirection {
        return this._direction;
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

    get upHillCounter(): number {
        return this._upHillCounter;
    }

    get downHillCounter(): number {
        return this._downHillCounter;
    }

    get leftWheelDistance(): number {
        return this._leftWheelDistance;
    }

    get rightWheelDistance(): number {
        return this._rightWheelDistance;
    }
}

export {TransitionUpdateMessage};