import {VehicleMessage} from "../vehicle-message";
import {Vehicle} from "../../vehicle/vehicle-interface";

class BatteryLevelResponse extends VehicleMessage {

    private _batteryLevel: number

    constructor(data: Buffer, vehicle: Vehicle) {
        super(data, vehicle);
        this._batteryLevel = data.readUInt16LE(2);
    }

    get batteryLevel(): number {
        return this._batteryLevel;
    }
}

export {BatteryLevelResponse}
