import {VehicleMessage} from "../vehicle-message";
import {TurnType} from "../turn-type";
import {TurnTrigger} from "../turn-trigger";

class Turn extends VehicleMessage {

    constructor(vehicleId: string, type: TurnType, trigger = TurnTrigger.IMMEDIATE) {
        super(new Buffer(4), vehicleId, 0x32, 3);
        this.data.writeUInt8(type, 2);
        this.data.writeUInt8(trigger, 3);
    }
}

export {Turn}
