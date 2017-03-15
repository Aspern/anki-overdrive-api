import {isNullOrUndefined} from "util";
/**
 * Contains general information about vehicles. Each message additionally contains the ID of its
 * vehicle and a creation timestamp.
 */
class VehicleMessage {

    private _messageId: number;
    private _vehicleId: string;
    private _timestamp: Date;
    protected _data: Buffer;

    constructor(data: Buffer, vehicleId: string, messageId?: number, size?: number) {
        if (!isNullOrUndefined(size))
            data.writeUInt8(size, 0);

        if (!isNullOrUndefined(messageId))
            data.writeUInt8(messageId, 1);

        this._vehicleId = vehicleId;
        this._messageId = data.readInt8(1);
        this._timestamp = new Date();
        this._data = data;
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

    get data(): Buffer {
        return this._data;
    }
}

export {VehicleMessage};