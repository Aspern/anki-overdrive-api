import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class PingResponse extends VehicleMessage {

    constructor(data: Buffer, vehicle: Vehicle) {
        super(data, vehicle);
    }

}

export {PingResponse}
