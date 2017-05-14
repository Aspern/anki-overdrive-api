import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Scenario} from "./scenario-interface";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import {isNullOrUndefined} from "util";
import {Distance} from "../../core/filter/distance";
import {LightConfig} from "../../core/vehicle/light-config";

class AntiCollisionScenario implements Scenario {

    private _vehicle1: Vehicle;
    private _vehicle2: Vehicle;
    private _store: { [key: string]: { vehicle: Vehicle, speed: number } } = {};
    private _running = false;

    private _timeouts: Array<any> = [];

    constructor(vehicle1: Vehicle, vehicle2: Vehicle) {

        this._vehicle1 = vehicle1;
        this._vehicle2 = vehicle2;


        this._store[this._vehicle1.id] = {vehicle: this._vehicle1, speed: 0};
        this._store[this._vehicle2.id] = {vehicle: this._vehicle2, speed: 0};
    }


    start(): Promise<void> {
        let me = this,
            v1 = me._vehicle1,
            v2 = me._vehicle2;

        me._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                v1.setSpeed(400);
                me._store[v1.id].speed = 400;
                v2.setSpeed(600);
                me._store[v2.id].speed = 600;

                me._timeouts.push(setTimeout(() => {
                    v1.changeLane(68);
                    v2.changeLane(68);
                }, 6000));

                resolve();
            } catch (e) {
                me._running = false;
                reject(e);
            }

        });
    }

    interrupt(): Promise<void> {
        let me = this;

        me._running = false;

        return new Promise<void>((resolve, reject) => {
            try {
                me._timeouts.forEach(clearTimeout);
                me._vehicle1.setSpeed(0, 1500);
                me._vehicle2.setSpeed(0, 1500);
                setTimeout(() => {
                    resolve();
                }, 1000);
            } catch (e) {
                reject(e);
            }
        });

    }


    brake(message: PositionUpdateMessage, speed: number) {
        let me = this,
            record = me._store[message.vehicleId],
            newSpeed = message.speed - speed;

        record.vehicle.setSpeed(newSpeed, newSpeed);
        record.vehicle.setLights([
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .red()
                .steady(),
            new LightConfig()
                .blue()
                .steady(0)
        ]);
    }

    holdSpeed(message: PositionUpdateMessage): void {
        let me = this,
            record = me._store[message.vehicleId];

        record.vehicle.setLights([
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .red()
                .steady(0),
            new LightConfig()
                .blue()
                .steady()
        ]);
    }

    speedUp(message: PositionUpdateMessage) {
        let me = this,
            record = me._store[message.vehicleId];

        record.vehicle.setSpeed(record.speed, 50);
        record.vehicle.setLights([
            new LightConfig()
                .green()
                .steady(),
            new LightConfig()
                .red()
                .steady(0),
            new LightConfig()
                .blue()
                .steady(0)
        ]);
    }

    handleAntiCollision(message: PositionUpdateMessage, distance: Distance): boolean {
        let me = this;
        if (distance.horizontal <= 500) {
            let newSpeed = 50;//Math.round(message.speed / (distance.horizontal /
            // Math.abs(distance.delta)));
            me.brake(message, newSpeed);
        } else if (distance.horizontal > 700) {
            me.driveNormal(message);
        } else {
            me.holdSpeed(message);
        }


        return true;
    }

    driveNormal(message: PositionUpdateMessage): void {
        let me = this,
            record = me._store[message.vehicleId];

        if (message.speed < record.speed - 30)
            me.speedUp(message);
        else
            me.holdSpeed(message);
    }


    onUpdate(message: VehicleMessage): void {
        let me = this;
        if (message instanceof PositionUpdateMessage && me._running) {
            let distances = message.distances,
                onCollision = false;

            distances.forEach(distance => {
                if (!isNullOrUndefined(distance.delta)
                    && distance.delta < 0
                    && distance.vertical <= 34)
                    onCollision = me.handleAntiCollision(message, distance);
            });

            if (!onCollision)
                me.driveNormal(message);
        }
    }


    isRunning(): boolean {
        return this._running;
    }
}

export {AntiCollisionScenario};