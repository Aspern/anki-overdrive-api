import {IVehicle} from "./IVehicle";
import {IDevice} from "../ble/IDevice";
import {ANKI_CHR_WRITE_UUID, ANKI_STR_CHR_READ_UUID} from "../message/GattProfile";

class Vehicle implements IVehicle {

    public readonly address: string;
    public readonly id: string;
    public readonly connected: boolean;
    public readonly name: string;
    public readonly offset: number;
    private _device: IDevice

    constructor(device: IDevice, offset = 0.0, name = "") {
        this._device = device
        this.name = name
        this.offset = offset
        this.id = device.id
        this.address = device.address
        this.connected = false
    }

    public cancelLaneChange(): void {
    }

    public changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void {
    }

    public connect(): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self._device.connect(
                ANKI_STR_CHR_READ_UUID,
                ANKI_CHR_WRITE_UUID
            ).then(() => resolve(self))
             .catch(reject)
        });
    }

    public disableSdkMode(): void {
    }

    public disconnect(): Promise<Vehicle> {
        const me = this

        return new Promise<Vehicle>(resolve => {
            resolve(me)
        });
    }

    public enableSdkMode(): void {
    }

    public queryBatterLevel(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public queryPing(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public queryVersion(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public setOffset(offset: number): void {
    }

    public setSpeed(speed: number, acceleration?: number, limit?: number): void {
    }

    public turnRight(): void {
    }

    public turnLeft(): void {
    }

    public uTurn(): void {
    }

    public uTurnJump(): void {
    }

}

export {Vehicle}