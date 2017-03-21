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

    constructor(vehicle1: Vehicle, vehicle2: Vehicle) {
        this._vehicle1 = vehicle1;
        this._vehicle2 = vehicle2;
        this._store[vehicle1.id] = {vehicle: vehicle1, speed: 0};
        this._store[vehicle2.id] = {vehicle: vehicle2, speed: 0};
    }


    start(): Promise<void> {
        let me = this,
            v1 = me._vehicle1,
            v2 = me._vehicle2;

        me._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                v1.setSpeed(400, 100);
                me._store[v1.id].speed = 400;
                v2.setSpeed(600, 100);
                me._store[v1.id].speed = 600;

                setTimeout(() => {
                    v1.changeLane(-68);
                    v2.changeLane(68);
                }, 3000);

                setTimeout(() => {
                    v1.changeLane(68);
                }, 10000);

                setTimeout(() => {
                    v1.setSpeed(700, 100);
                    me._store[v1.id].speed = 700;
                }, 30000);

                setTimeout(() => {
                    v2.setSpeed(350, 50);
                    me._store[v2.id].speed = 350;
                }, 50000);

                setTimeout(() => {
                    v2.changeLane(-68)
                }, 70000);

                setTimeout(() => {
                    me._running = false;
                    resolve();
                }, 100000);

            } catch (e) {
                me._running = false;
                reject(e);
            }
        });
    }

    interrupt(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            try {
                this._vehicle1.setSpeed(0, 1500);
                this._vehicle2.setSpeed(0, 1500);
                setTimeout(() => {
                    me._running = false;
                    resolve();
                }, 1000);
            } catch (e) {
                reject(e);
            }
        });

    }


    brake(message: PositionUpdateMessage) {
        let me = this,
            record = me._store[message.vehicleId];

        record.vehicle.setSpeed(message.speed - 50, 200);
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
        if (distance.horizontal <= 500)
            me.brake(message);
        else if (distance.horizontal > 700)
            me.driveNormal(message);
        else
            me.holdSpeed(message);


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
        if (message instanceof PositionUpdateMessage) {
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