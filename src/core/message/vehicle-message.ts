/**
 * Contains general information about vehicles. Each message additionally contains the ID of its
 * vehicle and a creation timestamp.
 */
class VehicleMessage {

    private _messageId: number;
    private _vehicleId: string;
    private _timestamp: Date;

    constructor(data: Buffer, vehicleId: string) {
        this._vehicleId = vehicleId;
        this._messageId = data.readInt8(1);
        this._timestamp = new Date();
    }


    get messageId(): number {
        return this._messageId;
    }

    get vehicleId(): string {
        return this._vehicleId;
    }

    get timestamp(): Date {
        return this._timestamp;
    }
}

export {VehicleMessage};