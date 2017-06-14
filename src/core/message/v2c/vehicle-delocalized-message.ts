import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

/**
 * This message is sent by the vehicle when it is no longer on the track.
 */
class VehicleDelocalizedMessage extends VehicleMessage {

    constructor(data: Buffer, vehicle: Vehicle) {
        super(data, vehicle);
    }

}

export {VehicleDelocalizedMessage};