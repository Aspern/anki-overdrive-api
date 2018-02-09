import {IVehicle} from "./IVehicle";
import {IDevice} from "../ble/IDevice";
import {ANKI_CHR_WRITE_UUID, ANKI_STR_CHR_READ_UUID} from "../message/GattProfile";
import {CancelLaneChange} from "../message/c2v/CancelLaneChange";
import {IVehicleMessage} from "../message/IVehicleMessage";
import {ChangeLane} from "../message/c2v/ChangeLane";
import {SdkMode} from "../message/c2v/SdkMode";
import {BatteryLevelRequest} from "../message/c2v/BatteryLevelRequest";
import {
    ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE, ANKI_VEHICLE_MSG_V2C_PING_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
} from "../message/Protocol";
import {BatteryLevelResponse} from "../message/v2c/BatteryLevelResponse";
import {MessageBuilder} from "../message/MessageBuilder";
import {PingRequest} from "../message/c2v/PingRequest";
import {PingResponse} from "../message/v2c/PingResponse";
import {VersionRequest} from "../message/c2v/VersionRequest";
import {VersionResponse} from "../message/v2c/VersionResponse";
import {SetOffsetFromRoadCenter} from "../message/c2v/SetOffsetFromRoadCenter";
import {SetSpeed} from "../message/c2v/SetSpeed";
import {Turn, TurnType} from "../message/c2v/Turn";

class Vehicle implements IVehicle {

    public readonly address: string;
    public readonly id: string;
    public readonly name: string;
    private _offset: number;
    private _device: IDevice
    private _listeners: Array<(message: any) => any>
    private _builder: MessageBuilder

    constructor(device: IDevice, offset = 0.0, name = "") {
        this._device = device
        this.name = name
        this._offset = offset
        this.id = device.id
        this.address = device.address
        this._listeners = []
        this._builder = new MessageBuilder()
    }

    public cancelLaneChange(): void {
        this.writeAndPublish(new CancelLaneChange(this.id))
    }

    public changeLane(offset: number, speed = 300, acceleration = 300, hopIntent = 0x0, tag = 0x0): void {
        this.writeAndPublish(new ChangeLane(
            this.id,
            offset,
            speed,
            acceleration,
            hopIntent,
            tag
        ))
    }

    public connect(): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self._device.connect(
                ANKI_STR_CHR_READ_UUID,
                ANKI_CHR_WRITE_UUID
            ).then(() =>  {
                self.enableSdkMode()
                self._device.read((data) => self.readAndPublish(data))
                resolve(self)
            }).catch(reject)
        });
    }

    public disableSdkMode(): void {
        this.writeAndPublish(new SdkMode(this.id, false))
    }

    public disconnect(): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self.disableSdkMode()
            self.removeAllListeners()
            self._device.disconnect()
                .then(() => {
                    resolve(self)
                }).catch(reject)
        });
    }

    public enableSdkMode(): void {
        this.writeAndPublish(new SdkMode(this.id, true))
    }

    public queryBatterLevel(): Promise<number> {
        const self = this

        return new Promise<number>((resolve, reject) => {
            self.sendRequest<BatteryLevelRequest, BatteryLevelResponse>(
                new BatteryLevelRequest(this.id),
                ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
            ).then((message: BatteryLevelResponse) => resolve(message.batteryLevel))
             .catch(reject)
        });
    }

    public queryPing(): Promise<number> {
        const self = this

        return new Promise<number>((resolve, reject) => {
            const request = new PingRequest(this.id)

            self.sendRequest<PingRequest, PingResponse>(
                request,
                ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
            ).then((message: PingResponse) => resolve(message.calculatePing(request)))
             .catch(reject)
        });
    }

    public queryVersion(): Promise<number> {
        const self = this

        return new Promise<number>((resolve, reject) => {
            self.sendRequest<VersionRequest, VersionResponse>(
                new VersionRequest(this.id),
                ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
            ).then((message: VersionResponse) => resolve(message.version))
             .catch(reject)
        });
    }

    public setOffset(offset: number): void {
        this.writeAndPublish(new SetOffsetFromRoadCenter(
            this.id,
            offset
        ))
        this._offset = offset
    }

    public setSpeed(speed: number, acceleration = 500, limit = false): void {
        this.writeAndPublish(new SetSpeed(
            this.id,
            speed,
            acceleration,
            limit
        ))
    }

    public turnLeft(): void {
        this.writeAndPublish(new Turn(
            this.id,
            TurnType.VEHICLE_TURN_LEFT
        ))
    }

    public turnRight(): void {
        this.writeAndPublish(new Turn(
            this.id,
            TurnType.VEHICLE_TURN_RIGHT
        ))
    }

    public uTurn(): void {
        this.writeAndPublish(new Turn(
            this.id,
            TurnType.VEHICLE_TURN_UTURN
        ))
    }

    public uTurnJump(): void {
        this.writeAndPublish(new Turn(
            this.id,
            TurnType.VEHICLE_TURN_UTURN_JUMP
        ))
    }

    public addListener<T extends IVehicleMessage>(listener: (message: T) => any): void {
        this._listeners.push(listener)
    }

    public get offset(): number {
        return this._offset
    }

    public removeListener<T extends IVehicleMessage>(listener: (message: T) => any): void {
        this._listeners = this._listeners.filter(l => listener !== l)
    }

    private removeAllListeners(): void {
        this._listeners = []
    }

    private readAndPublish(payload: Buffer): void {
        const self = this

        this._listeners.forEach(listener =>
            listener(self._builder
                .messageId(payload.readUInt8(1))
                .vehicleId(self.id)
                .payload(payload)
                .build()
            )
        )
    }

    private writeAndPublish<T extends IVehicleMessage>(message: T): void {
        const self = this

        this._device.write(message.payload).then(() => {
            self._listeners.forEach(listener => listener(message))
        })
    }

    private sendRequest<Req extends IVehicleMessage, Res extends IVehicleMessage>(
        request: Req, responseId: number): Promise<Res> {
        const self = this

        return new Promise<Res>((resolve, reject) => {
            const listener = (message: Res) => {
                if(message && message.payload.readUInt8(1) === responseId) {
                    clearTimeout(timeout)
                    self.removeListener(listener)
                    resolve(message)
                }
            }
            const timeout = setTimeout(() => {
                self.removeListener(listener)
                reject(new Error("Request timeout for " + responseId))
            }, 1500)
            self.addListener(listener)
            self.writeAndPublish(request)
        })
    }

}

export {Vehicle}