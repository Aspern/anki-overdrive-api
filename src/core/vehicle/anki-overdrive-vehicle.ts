/// <reference path="../../../decl/noble.d.ts"/>
import {Peripheral, Characteristic} from "noble";
import {Vehicle} from "./vehicle-interface";
import {VehicleMessage} from "../message/vehicle-message";
import {PositionUpdateMessage} from "../message/position-update-message";
import {TransitionUpdateMessage} from "../message/transition-update-message";
import {IntersectionUpdateMessage} from "../message/intersection-update-message";
import {TurnType} from "../message/turn-type";
import {VehicleDelocalizedMessage} from "../message/vehicle-delocalized-message";

/**
 * Default implementation of `Vehicle`. The connection with the vehicle will enable the SDK mode
 * and initialize the offset by default.
 */
class AnkiOverdriveVehicle implements Vehicle {

    private static _DEFAULT_OFFSET = 0;

    private _id: string;
    private _address: string;
    private _name: string;
    private _peripheral: Peripheral;
    private _read: Characteristic;
    private _write: Characteristic;
    private _listeners: Array<{l: (message: VehicleMessage) => any, f: any}> = [];

    constructor(peripheral: Peripheral, name?: string) {
        this._id = peripheral.id;
        this._address = peripheral.address;
        this._name = name;
        this._peripheral = peripheral;
    }

    connect(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me._peripheral.connect((e: Error) => {
                if (e)
                    reject(e);
                else
                    me.initCharacteristics()
                        .then(() => {
                            me.setSdkMode(true);
                            me.setOffset(AnkiOverdriveVehicle._DEFAULT_OFFSET);
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

                resolve(me);
            });
        });
    }

    setSpeed(speed: number, acceleration = 250): void {
        let data = new Buffer(7);

        data.writeUInt8(6, 0);
        data.writeUInt8(0x24, 1); // ANKI_VEHICLE_MSG_C2V_SET_SPEED
        data.writeUInt16LE(speed, 2);
        data.writeUInt16LE(acceleration, 4);

        this._write.write(data);
    }

    setOffset(offset: number): void {
        let data = new Buffer(6);

        data.writeUInt8(5, 0);
        data.writeUInt8(0x2c, 1); // ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER
        data.writeFloatLE(offset, 2);

        this._write.write(data);
    }

    changeLane(offset: number, speed = 300, acceleration = 250): void {
        let data = new Buffer(12);

        data.writeUInt8(11, 0);
        data.writeUInt8(0x25, 1); // ANKI_VEHICLE_MSG_C2V_CHANGE_LANE
        data.writeUInt16LE(speed, 2);
        data.writeUInt16LE(acceleration, 4);
        data.writeFloatLE(offset, 6);

        this._write.write(data);
    }

    cancelLaneChange(): void {
        let data = new Buffer(2);

        data.writeUInt8(1, 0);
        data.writeUInt8(0x26, 1) // ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE

        this._write.write(data);
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
        let data = new Buffer(4);

        data.writeUInt8(3, 0);
        data.writeUInt8(0x90, 1); // ANKI_VEHICLE_MSG_C2V_SDK_MODE
        data.writeUInt8(on ? 0x1 : 0x0, 2);
        data.writeUInt8(0x1, 3);

        this._write.write(data);
    }

    queryPing(): Promise<number> {
        let me = this,
            start = new Date().getTime();

        return new Promise<number>((resolve, reject) => {
            let request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x16, 1); // ANKI_VEHICLE_MSG_C2V_PING_REQUEST

            me.readOnce(request, 0x17) // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
                .then(() => {
                    resolve(new Date().getTime() - start);
                })
                .catch(reject);
        });
    }

    queryVersion(): Promise<number> {
        let me = this;

        return new Promise<number>((resolve, reject) => {
            let request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x18, 1); // ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST

            me.readOnce(request, 0x19) // ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
                .then((data: Buffer) => {
                    resolve(data.readUInt16LE(2));
                })
                .catch(reject);
        });
    }

    queryBatteryLevel(): Promise<number> {
        let me = this;

        return new Promise<number>((resolve, reject) => {
            let request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x1a, 1); // ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST

            me.readOnce(request, 0x1b) // ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
                .then((data: Buffer) => {
                    resolve(data.readUInt16LE(2));
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

    /**
     * Initializes all characteristics of the vehicles device. Characteristics could only
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

                if (!me._write || !me._write)
                    reject(new Error(("Could not initialise read/write characteristics.")));

                me._read.subscribe();
                me.enableDataEvents();
                resolve();
            });
        });
    }

    /**
     * Enables the data event on the read-characteristic and invokes any registered listener on
     * the vehicle. Data events can only be enabled after initializing the characteristics of the
     * vehicle.
     */
    private enableDataEvents(): void {
        let me = this;

        this._read.on('data', (data: Buffer) => {
            var id = data.readUInt8(1),
                message: VehicleMessage;

            if (id === 0x27) // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE
                message = new PositionUpdateMessage(data, me._id);
            else if (id === 0x29) // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE
                message = new TransitionUpdateMessage(data, me._id);
            else if (id === 0x2a) //ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE
                message = new IntersectionUpdateMessage(data, me._id);
            else if (id === 0x2b) // ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED
                message = new VehicleDelocalizedMessage(data, me._id);

            if (message)
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
     * Sends a request message and waits until the corresponding response arrives or the
     * `timeout` is reached.
     *
     * @param request Request message.
     * @param responseId ID of the response message.
     * @param timeout Timeout in milliseconds until waiting on response will fail (default is 1
     * second)
     * @return {Promise<Buffer>|Promise} Promise holding the response message.
     */
    private readOnce(request: Buffer, responseId: number, timeout = 1000): Promise<Buffer> {
        let me = this;


        return new Promise<Buffer>((resolve, reject) => {
            let handler = setTimeout(() => {
                    reject(new Error("Received no message after " + timeout + "ms."));
                }, timeout),
                listener = (data: Buffer) => {
                    let id = data.readUInt8(1);

                    if (id === responseId) {
                        clearTimeout(handler);
                        me._read.removeListener("data", listener);
                        resolve(data);
                    }
                };

            me._read.on('data', listener);
            me._write.write(request);
        });
    }

    /**
     * Executes a turn using a `TurnType`.
     *
     * @param type Type of the turn.
     */
    private turn(type: TurnType): void {
        let data = new Buffer(4);

        data.writeUInt8(3, 0);
        data.writeUInt8(0x32, 1); // ANKI_VEHICLE_MSG_C2V_TURN
        data.writeUInt8(type, 2);

        this._write.write(data);
    }


    get id(): string {
        return this._id;
    }

    get address(): string {
        return this._address;
    }

    get name(): string {
        return this._name;
    }
}

export {AnkiOverdriveVehicle}