import {VehicleMessage} from "../vehicle-message";
import {DrivingDirection} from "../driving-direction";
import {IntersectionCode} from "../intersection-code";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

/**
 * This message is sent by the vehicle when it has crossed a piece of the type `collision`.
 */
class IntersectionUpdateMessage extends VehicleMessage {

    private _piece: number;
    private _offset: number;
    private _direction: DrivingDirection;
    private _code: IntersectionCode;
    private _turn: number;
    private _exiting: boolean;

    constructor(data: Buffer, vehicle: Vehicle) {
        super(data, vehicle);
        this._piece = data.readInt8(2);
        this._offset = data.readFloatLE(3);
        this._direction = data.readInt8(7);
        this._code = data.readInt8(8);
        this._turn = data.readInt8(9);
        this._exiting = data.readInt8(10) === 0x1;
    }

    get piece(): number {
        return this._piece;
    }

    get offset(): number {
        return this._offset;
    }

    get direction(): DrivingDirection {
        return this._direction;
    }

    get code(): IntersectionCode {
        return this._code;
    }

    get turn(): number {
        return this._turn;
    }

    get exiting(): boolean {
        return this._exiting;
    }
}

export {IntersectionUpdateMessage};