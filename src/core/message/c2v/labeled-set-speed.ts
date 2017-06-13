import {SetSpeed} from "./set-speed";
import {Vehicle} from "../../vehicle/vehicle-interface";

class LabeledSetSpeed extends SetSpeed {

    private _label: boolean;
    private _piece: number;
    private _location: number;

    constructor(vehicle: Vehicle, speed: number, acceleration = 250, limit = false, label = true, piece?: number, location?: number) {
        super(vehicle, speed, acceleration, limit);

        this._label = label;
        this._piece = piece;
        this._location = location;
    }

    get label(): boolean {
        return this._label;
    }

    get piece(): number {
        return this._piece;
    }

    get location(): number {
        return this._location;
    }
}

export {LabeledSetSpeed};