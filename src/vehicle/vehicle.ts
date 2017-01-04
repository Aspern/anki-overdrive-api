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
    LocalizationTransitionUpdateMessage,
    LocalizationIntersectionUpdateMessage, OffsetFromRoadCenterUpdateMessage, PingResponseMessage,
    PingRequestMessage
} from "./vehicle-message";


class Vehicle {

    private static READ_UUID = "be15bee06186407e83810bd89c4d8df4";
    private static WRITE_UUID = "be15bee16186407e83810bd89c4d8df4";

    private peripheral: Peripheral;
    private name: string;
    private read: Characteristic;
    private write: Characteristic;

    private positionUpdateListener: Array<(msg: LocalizationPositionUpdateMessage) => any> = [];
    private transitionUpdateListener: Array<(msg: LocalizationTransitionUpdateMessage) => any> = [];
    private intersectionUpdateListener: Array<(msg: LocalizationIntersectionUpdateMessage) => any> = [];
    private offsetUpdateListener: Array<(msg: OffsetFromRoadCenterUpdateMessage) => any> = [];

    constructor(peripheral: Peripheral, name: string) {
        this.peripheral = peripheral;
        this.name = name;
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

    addPositionUpdateListener(listener: (message: LocalizationPositionUpdateMessage) => any) {
        this.positionUpdateListener.push(listener);
    }

    addTransitionUpdateListener(listener: (message: LocalizationTransitionUpdateMessage) => any) {
        this.transitionUpdateListener.push(listener);
    }

    addIntersectionUpdateListener(listener: (message: LocalizationIntersectionUpdateMessage) => any) {
        this.intersectionUpdateListener.push(listener);
    }

    addOffsetUpdateListener(listener: (message: OffsetFromRoadCenterUpdateMessage) => any) {
        this.offsetUpdateListener.push(listener);
    }

    removePositionUpdateListener(listener: (message: LocalizationPositionUpdateMessage) => any) {
        for (var i = 0; i < this.positionUpdateListener.length; ++i) {
            if (this.positionUpdateListener[i] === listener) {
                this.positionUpdateListener.splice(i, 1);
            }
        }
    }

    removeTransitionUpdateListener(listener: (message: LocalizationTransitionUpdateMessage) => any) {
        for (var i = 0; i < this.transitionUpdateListener.length; ++i) {
            if (this.transitionUpdateListener[i] === listener) {
                this.transitionUpdateListener.splice(i, 1);
            }
        }
    }

    removeIntersectionUpdateListener(listener: (message: LocalizationIntersectionUpdateMessage) => any) {
        for (var i = 0; i < this.intersectionUpdateListener.length; ++i) {
            if (this.intersectionUpdateListener[i] === listener) {
                this.intersectionUpdateListener.splice(i, 1);
            }
        }
    }

    removeOffsetUpdateListener(listener: (message: OffsetFromRoadCenterUpdateMessage) => any) {
        for (var i = 0; i < this.offsetUpdateListener.length; ++i) {
            if (this.offsetUpdateListener[i] === listener) {
                this.offsetUpdateListener.splice(i, 1);
            }
        }
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

            switch (id) {
                case MessageIds.LOCALIZATION_POSITION_UPDATE:
                    this.positionUpdateListener.forEach((listener) => {
                        listener(new LocalizationPositionUpdateMessage(data));
                    });
                    break;
                case MessageIds.LOCALIZATION_TRANSITION_UPDATE:
                    this.transitionUpdateListener.forEach((listener) => {
                        listener(new LocalizationTransitionUpdateMessage(data));
                    });
                    break;
                case MessageIds.LOCALIZATION_POSITION_UPDATE:
                    this.intersectionUpdateListener.forEach((listener) => {
                        listener(new LocalizationIntersectionUpdateMessage(data));
                    });
                    break;
                case MessageIds.OFFSET_FROM_ROAD_CENTER_UPDATE:
                    this.offsetUpdateListener.forEach((listener) => {
                        listener(new OffsetFromRoadCenterUpdateMessage(data));
                    });
                    break;
            }
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
