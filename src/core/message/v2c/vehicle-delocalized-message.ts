import {VehicleMessage} from "../vehicle-message";

/**
 * This message is sent by the vehicle when it is no longer on the track.
 */
class VehicleDelocalizedMessage extends VehicleMessage {

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
    }

}

export {VehicleDelocalizedMessage};