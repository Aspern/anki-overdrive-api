import {VehicleMessage} from "../vehicle-message";
import {TurnType} from "../turn-type";
import {TurnTrigger} from "../turn-trigger";

class Turn extends VehicleMessage {

    private _type: TurnType;
    private _trigger: TurnTrigger;

    constructor(vehicleId: string, type: TurnType, trigger = TurnTrigger.IMMEDIATE) {
        super(new Buffer(4), vehicleId, 0x32, 3);
        this.data.writeUInt8(type, 2);
        this._type = type;
        this.data.writeUInt8(trigger, 3);
        this._trigger = trigger;
    }
}

export {Turn}
