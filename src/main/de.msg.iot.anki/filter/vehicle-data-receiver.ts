import {DataReceiver} from "../component/data-receiver";
import {VehicleMessage} from "../../../core/message/vehicle-message";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {isNullOrUndefined} from "util";

type VehicleListenerStore = Array<{
    listener: (message: VehicleMessage) => any
    vehicle: Vehicle
}>;

class VehicleDataReceiver implements DataReceiver<VehicleMessage> {

    private _callback: (message: VehicleMessage) => any;
    private _store: VehicleListenerStore = [];
    private _running = false;

    constructor(vehicles: Array<Vehicle>) {
        this.updateVehicles(vehicles);
    }


    receive(callback: (data: VehicleMessage) => any): void {
        this._callback = callback;
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            if (isNullOrUndefined(me._callback)) {
                reject("No receive callback defined.");
            } else {
                me._running = true;
                resolve();
            }
        });
    }

    stop(): Promise<void> {
        let me = this;
        return new Promise<void>((resolve, reject) => {
            try {
                me.clearStore();
                me._running = false;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    updateVehicles(vehicles: Array<Vehicle>) {
        let store = this._store,
            me = this;

        this.clearStore();

        vehicles.forEach(vehicle => {
            let entry = {
                vehicle: vehicle,
                listener: (message: VehicleMessage) => {
                    if (me._running)
                        me._callback(message);
                }
            };
            entry.vehicle.addListener(entry.listener);
            store.push(entry);
        })
    }

    private clearStore() {
        let store = this._store;

        store.forEach(entry => {
            entry.vehicle.removeListener(entry.listener);
        });

        this._store = [];
    }
}

export {VehicleDataReceiver}