import {VehicleMessage} from "../vehicle-message";

class PingResponse extends VehicleMessage {

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
    }

}

export {PingResponse}
