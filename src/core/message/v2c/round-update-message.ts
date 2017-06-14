import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {LabeledPositionUpdateMessage} from "./labeled-position-update-message";
import {LabeledSetSpeed} from "../c2v/labeled-set-speed";

class RoundUpdateMessage extends VehicleMessage {

    private _round: number;
    private _quality: number;
    private _profit: number;
    private _labeledPositions: Array<LabeledPositionUpdateMessage>;

    constructor(vehicle: Vehicle,
                round: number,
                quality: number,
                labeledPositions: Array<LabeledPositionUpdateMessage>,
                profit: number) {
        super(new Buffer(2), vehicle, 0x89, 2);
        this._round = round;
        this._quality = quality;
        this._labeledPositions = labeledPositions;
        this._profit = profit;
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


    get profit(): number {
        return this._profit;
    }
}

export {RoundUpdateMessage};