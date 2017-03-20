import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Scenario} from "./scenario-interface";
import {VehicleDelocalizedMessage} from "../../core/message/v2c/vehicle-delocalized-message";
import {LightConfig} from "../../core/vehicle/light-config";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";

class CollisionScenario implements Scenario {

    private _vehicle1: Vehicle;
    private _vehicle2: Vehicle;
    private _store: {[key: string]: Vehicle} = {};
    private _collided = false;

    constructor(vehicle1: Vehicle, vehicle2: Vehicle) {
        this._vehicle1 = vehicle1;
        this._vehicle2 = vehicle2;
        this._store[vehicle1.id] = vehicle1;
        this._store[vehicle2.id] = vehicle2;
    }


    start(): Promise<void> {
        let me = this,
            v1 = me._vehicle1,
            v2 = me._vehicle2;

        return new Promise<void>((resolve, reject) => {
            try {
                v1.setSpeed(350, 100);
                v2.setSpeed(900, 100);

                setTimeout(() => {
                    v1.changeLane(-68);
                    v2.changeLane(50.5);
                }, 3000);

                setTimeout(() => {
                    v1.changeLane(68);
                }, 13000);

                let interval = setInterval(() => {
                    if (me._collided) {
                        clearInterval(interval);
                        resolve();
                    }

                }, 200)

            } catch (e) {
                reject(e);
            }
        });
    }

    interrupt(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._vehicle1.setSpeed(0, 1500);
                this._vehicle2.setSpeed(0, 1500);
                setTimeout(() => {
                    resolve();
                }, 1000);
            } catch (e) {
                reject(e);
            }
        });

    }

    showCollision() {
        let me = this;

        for (let key in me._store) {
            if (me._store.hasOwnProperty(key)) {
                let vehicle = me._store[key];
                vehicle.setSpeed(0, 1500);
                vehicle.setLights([
                    new LightConfig()
                        .blue()
                        .steady(0),
                    new LightConfig()
                        .red()
                        .flash(0, 10, 10),
                    new LightConfig()
                        .tail()
                        .flash(0, 10, 10)
                ]);
            }
        }

        setTimeout(() => {
            me._collided = true;
        }, 10000);
    }

    onUpdate(message: VehicleMessage): void {
        let me = this;

        if (message instanceof PositionUpdateMessage) {

            message.distances.forEach(distance => {
                if (distance.vertical < 34 && distance.horizontal < 200)
                    me.showCollision();
            });

        } else if (message instanceof VehicleDelocalizedMessage) {
            me.showCollision();
        }
    }
}

export {CollisionScenario};