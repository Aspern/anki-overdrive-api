/// <reference path="../../../decl/noble.d.ts"/>
import {Peripheral, Characteristic} from "noble";
import {Vehicle} from "./vehicle-interface";
import {VehicleMessage} from "../message/vehicle-message";
import {PositionUpdateMessage} from "../message/v2c/position-update-message";
import {TransitionUpdateMessage} from "../message/v2c/transition-update-message";
import {IntersectionUpdateMessage} from "../message/v2c/intersection-update-message";
import {TurnType} from "../message/turn-type";
import {VehicleDelocalizedMessage} from "../message/v2c/vehicle-delocalized-message";
import {LightConfig} from "./light-config";
import {SetSpeed} from "../message/c2v/set-speed";
import {SetOffset} from "../message/c2v/set-offset";
import {ChangeLane} from "../message/c2v/change-lane";
import {CancelLaneChange} from "../message/c2v/cancel-lane-change";
import {Turn} from "../message/c2v/turn";
import {SdkMode} from "../message/c2v/sdk-mode";
import {PingRequest} from "../message/c2v/ping-request";
import {PingResponse} from "../message/v2c/ping-response";
import {VersionResponse} from "../message/v2c/version-response";
import {BatteryLevelResponse} from "../message/v2c/battery-level-response";
import {VersionRequest} from "../message/c2v/version-request";
import {BatteryLevelRequest} from "../message/c2v/battery-level-request";
import {SetLights} from "../message/c2v/set-lights";
import {Setup} from "../setup";
import {isNull, isNullOrUndefined} from "util";

/**
 * Default implementation of `Vehicle`. The connection with the vehicle will enable the SDK mode
 * and initialize the offset by default.
 */
class AnkiOverdriveVehicle implements Vehicle {

    private static _DEFAULT_OFFSET = 0;

    private _id: string;
    private _setupId: string;
    private _address: string;
    private _name: string;
    private _peripheral: Peripheral;
    private _read: Characteristic;
    private _write: Characteristic;
    private _listeners: Array<{ l: (message: VehicleMessage) => any, f: any }> = [];
    private _speed: number;
    private _connected = false;
    private _dataListener = (message: PositionUpdateMessage) => {
        this._speed = message.speed;
    };

    constructor(peripheral: Peripheral, setup: Setup, name?: string) {
        this._id = peripheral.id;
        this._address = peripheral.address;
        this._name = name;
        this._setupId = setup.ean;
        this._peripheral = peripheral;
    }

    connect(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("Timeout reeched."));
            }, 5000);
            me._peripheral.connect((e: Error) => {
                if (e)
                    reject(e);
                else
                    me.initCharacteristics()
                        .then(() => {
                            me.setSdkMode(true);
                            me.setOffset(AnkiOverdriveVehicle._DEFAULT_OFFSET);
                            me.addListener(me._dataListener, PositionUpdateMessage);
                            me._connected = true;
                            resolve(me);
                        })
                        .catch(reject);
            });
        });
    }

    disconnect(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me._peripheral.disconnect((e: Error) => {
                if (e)
                    reject(e);

                me.removeListener(me._dataListener);
                me._connected = false;
                resolve(me);
            });
        });
    }

    setSpeed(speed: number, acceleration = 250, limit = false): void {
        this.sendMessage(new SetSpeed(
            this,
            speed,
            acceleration,
            limit
        ));
    }

    setOffset(offset: number): void {
        this.sendMessage(new SetOffset(
            this,
            offset
        ));
    }

    changeLane(offset: number, speed = 300, acceleration = 250, hopIntent = 0x0, tag = 0x0): void {
        this.sendMessage(new ChangeLane(
            this,
            offset,
            speed,
            acceleration,
            hopIntent,
            tag
        ));
    }

    cancelLaneChange(): void {
        this.sendMessage(new CancelLaneChange(
            this
        ));
    }

    turnLeft(): void {
        this.turn(TurnType.VEHICLE_TURN_LEFT);
    }

    turnRight(): void {
        this.turn(TurnType.VEHICLE_TURN_RIGHT);
    }

    uTurn(): void {
        this.turn(TurnType.VEHICLE_TURN_UTURN);
    }

    uTurnJump(): void {
        this.turn(TurnType.VEHICLE_TURN_UTURN_JUMP);
    }

    setSdkMode(on: boolean): void {
        this.sendMessage(new SdkMode(
            this,
            on
        ));
    }

    queryPing(): Promise<number> {
        let me = this,
            start = new Date().getTime();

        return new Promise<number>((resolve, reject) => {
            let request = new PingRequest(me);

            me.readOnce(request, 0x17) // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
                .then(() => {
                    resolve(new Date().getTime() - start);
                }).catch(reject);
        });
    }

    queryVersion(): Promise<number> {
        let me = this;

        return new Promise<number>((resolve, reject) => {
            let request = new VersionRequest(me);

            me.readOnce(request, 0x19) // ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
                .then((response: VersionResponse) => {
                    resolve(response.version);
                })
                .catch(reject);
        });
    }

    queryBatteryLevel(): Promise<number> {
        let me = this;

        return new Promise<number>((resolve, reject) => {
            let request = new BatteryLevelRequest(me);

            me.readOnce(request, 0x1b)
                .then((response: BatteryLevelResponse) => {
                    resolve(response.batteryLevel);
                })
                .catch(reject);
        });
    }

    addListener(listener: (message: VehicleMessage) => any, filter?: any): void {
        this._listeners.push({l: listener, f: filter});
    }

    removeListener(listener: (message: VehicleMessage) => any): void {
        for (var i = 0; i < this._listeners.length; ++i) {
            if (this._listeners[i].l === listener)
                this._listeners.splice(i, 1);
        }
    }


    setLights(config: LightConfig | Array<LightConfig>): void {
        this.sendMessage(new SetLights(
            this,
            config
        ));
    }

    brake(strength = 0.10): void {
        let speed = this._speed,
            acceleration = 0,
            lightConfig = new LightConfig()
                .red()
                .steady(),
            timeout: number;

        speed -= speed * strength;
        timeout = Math.round(1000 / (speed / 180));

        if (strength > 0.6) {
            acceleration = speed;
        } else {
            acceleration = Math.round(0.5 * speed);
            timeout += 500;
            lightConfig = new LightConfig()
                .red()
                .fade(0, 15, 15);
        }

        this.setSpeed(speed, acceleration);
        this.setLights([
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .blue()
                .steady(0),
            lightConfig
        ]);

        setTimeout(() => {
            this.setLights([
                new LightConfig()
                    .green()
                    .steady(0),
                new LightConfig()
                    .blue()
                    .steady(),
                new LightConfig()
                    .red()
                    .steady(0),
            ]);
        }, timeout);
    }

    accelerate(maxSpeed: number, strength = 0.25): void {
        // Only accelerate if necessary
        if ((Math.abs(maxSpeed - this._speed)) < 25)
            return;

        let me = this,
            listener = (message: PositionUpdateMessage) => {
                if (message.speed >= maxSpeed) {
                    me.removeListener(listener);
                    me.setLights([
                        new LightConfig()
                            .green()
                            .steady(0),
                        new LightConfig()
                            .blue()
                            .steady(),
                        new LightConfig()
                            .red()
                            .steady(0),
                    ]);
                }
            };

        me.addListener(listener);
        me.setSpeed(maxSpeed, maxSpeed * strength);
        me.setLights([
            new LightConfig()
                .green()
                .steady(),
            new LightConfig()
                .blue()
                .steady(0),
            new LightConfig()
                .red()
                .steady(0),
        ]);
    }

    private sendMessage(message: VehicleMessage): void {
        let me = this;

        me._write.write(message.data, false, () => {
            me._listeners.forEach((listener) => {
                if (listener.f) {
                    if (message instanceof listener.f)
                        listener.l(message);
                } else {
                    listener.l(message);
                }
            });
        });
    }

    /**
     * Initializes all characteristics of the vehc device. Characteristics could only
     * registered if the device is connected via Bluetooth.
     *
     * @return {Promise<void>|Promise} Promise holding state after initializing characteristics.
     */
    private initCharacteristics(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me._peripheral.discoverAllServicesAndCharacteristics((e, services, characteristics) => {
                if (e)
                    reject(e);

                characteristics.forEach((characteristic) => {
                    if (characteristic.uuid === "be15bee06186407e83810bd89c4d8df4")
                        me._read = characteristic;
                    else if (characteristic.uuid === "be15bee16186407e83810bd89c4d8df4")
                        me._write = characteristic;
                });

                if (isNullOrUndefined(me._read))
                    reject(new Error(("Could not initialise read characteristics.")));
                if(isNullOrUndefined(me._write))
                    reject(new Error(("Could not initialise write characteristics.")));

                me._read.subscribe();
                me.enableDataEvents();
                resolve();
            });
        });
    }

    /**
     * Enables the enrich event on the read-characteristic and invokes any registered listener on
     * the vehicle. Data events can only be enabled after initializing the characteristics of the
     * vehicle.
     */
    private enableDataEvents(): void {
        let me = this;

        this._read.on('data', (data: Buffer) => {
            me.createMessageAndInvokeListeners(data);
        });
    }

    private createMessageAndInvokeListeners(data: Buffer): VehicleMessage {
        let me = this,
            id = data.readUInt8(1),
            message: VehicleMessage;

        if (id === 0x27) // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE
            message = new PositionUpdateMessage(data, me);
        else if (id === 0x29) // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE
            message = new TransitionUpdateMessage(data, me);
        else if (id === 0x2a) //ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE
            message = new IntersectionUpdateMessage(data, me);
        else if (id === 0x2b) // ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED
            message = new VehicleDelocalizedMessage(data, me);
        else if (id === 0x17) // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
            message = new PingResponse(data, me)
        else if (id === 0x19) // ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
            message = new VersionResponse(data, me);
        else if (id === 0x1b) // ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
            message = new BatteryLevelResponse(data, me);

        if (message)
            me._listeners.forEach((listener) => {
                if (listener.f) {
                    if (message instanceof listener.f)
                        listener.l(message);
                } else {
                    listener.l(message);
                }
            });

        return message;
    }

    /**
     * Sends a request message and waits until the corresponding response arrives or the
     * `timeout` is reached.
     *
     * @param request Request message.
     * @param responseId ID of the response message.
     * @param timeout Timeout in milliseconds until waiting on response will fail (default is 1
     * second)
     * @return {Promise<Buffer>|Promise} Promise holding the response message.
     */
    private readOnce(request: VehicleMessage, responseId: number, timeout = 1000): Promise<VehicleMessage> {
        let me = this;

        return new Promise<VehicleMessage>((resolve, reject) => {
            let handler = setTimeout(() => {
                    reject(new Error("Received no message after " + timeout + "ms."));
                }, timeout),
                listener = (data: Buffer) => {
                    let id = data.readUInt8(1);

                    if (id === responseId) {
                        clearTimeout(handler);
                        me._read.removeListener("data", listener);
                        resolve(me.createMessageAndInvokeListeners(data));
                    }
                };

            me._read.on('data', listener);
            me.sendMessage(request);
        });
    }

    /**
     * Executes a turn using a `TurnType`.
     *
     * @param type Type of the turn.
     */
    private turn(type: TurnType): void {
        this.sendMessage(new Turn(
            this,
            type
        ));
    }


    get id(): string {
        return this._id;
    }

    get setupId(): string {
        return this._setupId;
    }

    get address(): string {
        return this._address;
    }

    get name(): string {
        return this._name;
    }

    get connected(): boolean {
        return this._connected;
    }
}

export {AnkiOverdriveVehicle}