/// <reference path="../../decl/noble.d.ts"/>
import {Peripheral, Characteristic} from "noble";
import {
    MessageIds,
    VehicleMessage,
    VersionResponseMessage,
    SdkModeMessage,
    SetSpeedMessage,
    VersionRequestMessage,
    BatteryResponseMessage,
    BatteryRequestMessage,
    LaneOffsets,
    ChangeLaneMessage,
    SetOffsetFromRoadCenterMessage,
    LocalizationPositionUpdateMessage,
    PingResponseMessage,
    PingRequestMessage
} from "./vehicle-message";

class VehicleUpdateMessage extends LocalizationPositionUpdateMessage {

    vehicleId: string;
    address: string;
    name: string;

    constructor(data: Buffer, id: string, address: string, name: string) {
        super(data);
        this.vehicleId = id;
        this.address = address;
        this.name = name;
    }
}


class Vehicle {

    private static READ_UUID = "be15bee06186407e83810bd89c4d8df4";
    private static WRITE_UUID = "be15bee16186407e83810bd89c4d8df4";

    private peripheral: Peripheral;
    private name: string;
    private id: string;
    private address: string;
    private read: Characteristic;
    private write: Characteristic;

    private listeners: Array<(msg: VehicleUpdateMessage) => any> = [];


    constructor(peripheral: Peripheral, name: string) {
        this.peripheral = peripheral;
        this.name = name;
        this.id = peripheral.uuid;
        this.address = peripheral.address;
    }

    connect(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.peripheral.connect((e) => {
                if (e)
                    reject(e);

                me.initCharacteristics()
                    .then(() => resolve(this))
                    .catch((e) => reject(e));
            });
        });
    }

    disconnect(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.peripheral.disconnect((e: Error) => {
                if (e)
                    reject(e);

                resolve();
            });
        });
    }

    enableSdkMode(): Promise<void> {
        return this.setSdkMode(true);
    }

    disableSdkMode(): Promise<void> {
        return this.setSdkMode(false);
    }

    getPing(): Promise<PingResponseMessage> {
        let me = this;

        return new Promise<PingResponseMessage>((resolve, reject) => {
            me.writeMessage(new PingRequestMessage()).then(() => {
                me.readMessage(MessageIds.PING_RESPONSE).then((data) => {
                    resolve(new PingResponseMessage(data));
                }).catch(reject);
            }).catch(reject);
        });
    }

    getVersion(): Promise<VersionResponseMessage> {
        let me = this;

        return new Promise<VersionResponseMessage>((resolve, reject) => {
            me.writeMessage(new VersionRequestMessage()).then(() => {
                me.readMessage(MessageIds.VERSION_RESPONSE).then((data) => {
                    resolve(new VersionResponseMessage(data));
                }).catch(reject);
            }).catch(reject);
        });
    }

    getBatteryLevel(): Promise<BatteryResponseMessage> {
        let me = this;

        return new Promise<BatteryResponseMessage>((resolve, reject) => {
            me.writeMessage(new BatteryRequestMessage()).then(() => {
                me.readMessage(MessageIds.BATTERY_LEVEL_RESPONSE).then((data) => {
                    resolve(new BatteryResponseMessage(data));
                }).catch(reject);
            }).catch(reject);
        });
    }

    setSdkMode(on: boolean): Promise<void> {
        return this.writeMessage(new SdkModeMessage(on));
    }

    setSpeed(speed: number, acceleration?: number): Promise<void> {
        let speedMessage = new SetSpeedMessage(speed);

        if (acceleration)
            speedMessage.acceleration(acceleration);

        return this.writeMessage(speedMessage);
    }

    changeLane(lane: LaneOffsets): Promise<void> {
        return this.writeMessage(new ChangeLaneMessage(lane));
    }

    changeToLane1(): Promise<void> {
        return this.changeLane(LaneOffsets.LANE_1);
    }

    changeToLane2(): Promise<void> {
        return this.changeLane(LaneOffsets.LANE_2);
    }

    changeToLane3(): Promise<void> {
        return this.changeLane(LaneOffsets.LANE_3);
    }

    changeToLane4(): Promise<void> {
        return this.changeLane(LaneOffsets.LANE_4);
    }

    changeToCenter(): Promise<void> {
        return this.changeLane(LaneOffsets.CENTER);
    }

    setOffsetFromRoadCenter(offset: number) {
        return this.writeMessage(new SetOffsetFromRoadCenterMessage(offset));
    }

    addListener(listener: (message: VehicleUpdateMessage) => any) {
        this.listeners.push(listener);
    }


    removeListener(listener: (message: VehicleUpdateMessage) => any) {
        for (var i = 0; i < this.listeners.length; ++i) {
            if (this.listeners[i] === listener) {
                this.listeners.splice(i, 1);
            }
        }
    }

    getName(): string {
        return this.name;
    }

    getAdddress(): string {
        return this.address
    }

    getId(): string {
        return this.id;
    }

    private writeMessage(message: VehicleMessage): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me.write.write(message.payload, false, (e) => {
                if (e)
                    reject(e);

                resolve();
            });
        });
    }

    private readMessage(messageId: number): Promise<Buffer> {
        let me = this;

        return new Promise<Buffer>((resolve, reject) => {
            let callback = (data: Buffer) => {
                let id = data.readUInt8(1);
                if (id === messageId) {
                    me.read.removeListener('data', callback);
                    resolve(data);
                }
            };

            me.read.on('data', callback);
        });
    }

    private enableDataListener(): void {
        this.read.on('data', (data: Buffer) => {
            let id = data.readUInt8(1);

            if (id === MessageIds.LOCALIZATION_POSITION_UPDATE)
                this.listeners.forEach((listener) => {
                    listener(new VehicleUpdateMessage(data, this.id, this.address, this.name));
                });
        });
    }


    private initCharacteristics(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me.peripheral.discoverAllServicesAndCharacteristics((e, services, characteristics) => {
                if (e)
                    reject(e);

                characteristics.forEach((characteristic) => {
                    if (characteristic.uuid === Vehicle.READ_UUID)
                        me.read = characteristic;
                    else if (characteristic.uuid === Vehicle.WRITE_UUID)
                        me.write = characteristic;
                });

                if (!me.write || !me.write)
                    reject(new Error(("Could not initialise read/write characteristics.")));

                me.read.subscribe();
                me.enableDataListener();

                me.enableSdkMode()
                    .then(resolve)
                    .catch(reject);
            });
        });
    }


}

export {Vehicle};
