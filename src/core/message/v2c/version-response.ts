import {VehicleMessage} from "../vehicle-message";

class VersionResponse extends VehicleMessage {

    private _version: number;

    constructor(data: Buffer, vehicleId: string) {
        super(data, vehicleId);
        this._version = data.readUInt16LE(2);
    }

    get version(): number {
        return this._version;
    }
}

export {VersionResponse}
