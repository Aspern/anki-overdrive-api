/**
 * Contains general information about vehicles. Each message additionally contains the ID of its
 * vehicle and a creation timestamp.
 */
class VehicleMessage {

    private _id: number;
    private _vehicleId: string;
    private _timestamp: Date;

    constructor(data: Buffer, vehicleId: string) {
        this._vehicleId = vehicleId;
        this._id = data.readInt8(1);
        this._timestamp = new Date();
    }


    get id(): number {
        return this._id;
    }

    get vehicleId(): string {
        return this._vehicleId;
    }

    get timestamp(): Date {
        return this._timestamp;
    }
}

export {VehicleMessage};