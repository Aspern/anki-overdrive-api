import {Vehicle} from "../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {Scenario} from "./scenario-interface";
import {VehicleMessage} from "../../core/message/vehicle-message";

class MaxSpeedScenario implements Scenario {

    private _vehicle: Vehicle;
    private _store: { [key: string]: Vehicle } = {};
    private _running = false;

    constructor(vehicle: Vehicle) {
        this._vehicle = vehicle;
        this._store[vehicle.id] = vehicle;
    }


    start(): Promise<void> {
        let me = this,
            v = me._vehicle;

        me._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                v.setSpeed(1100, 100);

                setTimeout(() => {
                    v.changeLane(0)
                }, 2000);

                setTimeout(() => {
                    v.setSpeed(0, 100);
                }, 60000);

                setTimeout(() => {
                    me._running = false;
                    resolve();
                }, 71000);

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
                this._vehicle.setSpeed(0, 500);
                setTimeout(() => {
                    me._running = false;
                    resolve();
                }, 3000);
            } catch (e) {
                reject(e);
            }
        });

    }


    onUpdate(message: VehicleMessage): void {
        // Not needed.
    }

    isRunning(): boolean {
        return this._running;
    }
}

export {MaxSpeedScenario};