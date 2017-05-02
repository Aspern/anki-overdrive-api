import {isNullOrUndefined} from "util";
import {Vehicle} from "../vehicle/vehicle-interface";
import {AnkiMessage} from "./anki-message";
/**
 * Contains general information about vehicles. Each message additionally contains the ID of its
 * vehicle and a creation timestamp.
 */
class VehicleMessage extends AnkiMessage {

    private static MESSAGE_NAMES: { [key: number]: string } = {
        0x16: "pingRequest",
        0x17: "pingResponse",
        0x18: "versionRequest",
        0x19: "versionResponse",
        0x1a: "batteryLevelRequest",
        0x1b: "batteryLevelResponse",
        0x1d: "setLights",
        0x24: "setSpeed",
        0x25: "changeLane",
        0x26: "cancelLaneChange",
        0x32: "turn",
        0x27: "positionUpdate",
        0x29: "transitionUpdate",
        0x2a: "intersectionUpdate",
        0x2b: "delocalized",
        0x2c: "setOffset",
        0x90: "setSdkMode"
    };

    private _messageId: number;
    private _vehicleId: string;
    private _setupId: string;
    private _timestamp: Date;
    protected _data: Buffer;

    constructor(data: Buffer, vehicle: Vehicle, messageId?: number, size?: number) {
        super(VehicleMessage.getNameById(
            isNullOrUndefined(messageId) ? data.readInt8(1) : messageId
        ));
        if (!isNullOrUndefined(size))
            data.writeUInt8(size, 0);

        if (!isNullOrUndefined(messageId))
            data.writeUInt8(messageId, 1);

        this._vehicleId = vehicle.id;
        this._messageId = data.readInt8(1);
        this._timestamp = new Date();
        this._data = data;
        this._setupId = vehicle.setupId;
    }


    get messageId(): number {
        return this._messageId;
    }

    get vehicleId(): string {
        return this._vehicleId;
    }

    get setupId(): string {
        return this._setupId;
    }

    get timestamp(): Date {
        return this._timestamp;
    }

    get data(): Buffer {
        return this._data;
    }

    private static getNameById(messageId: number): string {
        return VehicleMessage.MESSAGE_NAMES[messageId];
    }
}

export {VehicleMessage};