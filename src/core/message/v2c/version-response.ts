import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";

class VersionResponse extends VehicleMessage {

    private _version: number;

    constructor(data: Buffer, vehicle: Vehicle) {
        super(data, vehicle);
        this._version = data.readUInt16LE(2);
    }

    get version(): number {
        return this._version;
    }
}

export {VersionResponse}
