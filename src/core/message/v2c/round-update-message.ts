import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";
import {LabeledPositionUpdateMessage} from "./labeled-position-update-message";

class RoundUpdateMessage extends VehicleMessage {

    private _round: number;
    private _quality: number;
    private _labeledPositions: Array<LabeledPositionUpdateMessage>;

    constructor(vehicle: Vehicle,
                round: number,
                quality: number,
                labeledPositions: Array<LabeledPositionUpdateMessage>) {
        super(new Buffer(2), vehicle, 0x89, 2);
        this._round = round;
        this._quality = quality;
        this._labeledPositions = labeledPositions;
    }

    get round(): number {
        return this._round;
    }

    get quality(): number {
        return this._quality;
    }

    get labeledPositions(): Array<LabeledPositionUpdateMessage> {
        return this._labeledPositions;
    }
}

export {RoundUpdateMessage};