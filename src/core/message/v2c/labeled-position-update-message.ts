import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "./position-update-message";

class LabeledPositionUpdateMessage extends PositionUpdateMessage {

    private _missing: boolean;

    constructor(data: Buffer, vehicle: Vehicle, missing = false) {
        super(data, vehicle);
        this._missing = missing;
    }

    get missing(): boolean {
        return this._missing;
    }
}

export {LabeledPositionUpdateMessage};