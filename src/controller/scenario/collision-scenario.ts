import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Scenario} from "./scenario-interface";
import {VehicleDelocalizedMessage} from "../../core/message/v2c/vehicle-delocalized-message";
import {LightConfig} from "../../core/vehicle/light-config";

class CollisionScenario implements Scenario {

    private _vehicle1: Vehicle;
    private _vehicle2: Vehicle;

    constructor(vehicle1: Vehicle, vehicle2: Vehicle) {
        this._vehicle1 = vehicle1;
        this._vehicle2 = vehicle2;
    }


    start(): Promise<void> {
        let me = this,
            v1 = me._vehicle1,
            v2 = me._vehicle2;

        return new Promise<void>((resolve, reject) => {
            try {
                v1.setSpeed(400, 50);
                v2.setSpeed(700, 50);

                v1.addListener((msg: VehicleDelocalizedMessage) => {
                    v1.setSpeed(0, 1500);
                    v2.setSpeed(0, 100);

                    v1.setLights([
                        new LightConfig()
                            .blue()
                            .steady(0),
                        new LightConfig()
                            .red()
                            .flash(),
                        new LightConfig()
                            .tail()
                            .flash()
                    ]);
                    v2.setLights([
                        new LightConfig()
                            .blue()
                            .steady(0),
                        new LightConfig()
                            .red()
                            .flash(),
                        new LightConfig()
                            .tail()
                            .flash()
                    ]);

                }, VehicleDelocalizedMessage);

                setTimeout(() => {
                    v1.changeLane(-68);
                    v2.changeLane(68);
                }, 2000);

                setTimeout(() => {
                    v1.changeLane(68);
                }, 10000);

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
}

export {CollisionScenario};