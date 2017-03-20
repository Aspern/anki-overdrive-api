import {VehicleMessage} from "../vehicle-message";

class BatteryLevelResponse extends VehicleMessage {

    private _batteryLevel: number

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
        this._batteryLevel = data.readUInt16LE(2);
    }

    get batteryLevel(): number {
        return this._batteryLevel;
    }
}

export {BatteryLevelResponse}
