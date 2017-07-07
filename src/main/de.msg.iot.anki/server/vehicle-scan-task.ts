import {Runnable} from "../component/runnable";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {VehicleScanner} from "../core/vehicle/vehicle-scanner-interface";
import {isNullOrUndefined} from "util";

class VehicleScanTask implements Runnable {

    private _vehicles: Array<Vehicle>;
    private _scanner: VehicleScanner;
    private _callback: (vehicles: Array<Vehicle>) => any;

    constructor(vehicles: Array<Vehicle>, scanner: VehicleScanner) {
        this._vehicles = vehicles;
        this._scanner = scanner;
    }

    run(): void {
        let me = this;

        me._scanner.findAll()
            .then(vehicles => {
                me.synchronize(vehicles);
            }).catch(error => {
            throw error;
        });
    }

    onSynchronize(callback: (vehicles: Array<Vehicle>) => any) {
        this._callback = callback;
    }

    private synchronize(newVehicles: Array<Vehicle>) {
        let vehicles = this._vehicles,
            missing: boolean,
            ids: Array<string> = [],
            changes = false;

        newVehicles.forEach(newVehicle => {
            missing = true;
            vehicles.forEach(vehicle => {
                if (vehicle.connected || vehicle.id === newVehicle.id) {
                    missing = false;
                    ids.push(vehicle.id);
                }

            });
            if (missing) {
                vehicles.push(newVehicle);
                ids.push(newVehicle.id);
                changes = true;
            }
        });

        vehicles.forEach(vehicle => {
            if (!vehicle.connected && ids.indexOf(vehicle.id) < 0) {
                vehicles.splice(vehicles.indexOf(vehicle), 1);
                changes = true;
            }
        });

        if(changes && !isNullOrUndefined(this._callback)) {
            this._callback(vehicles);
        }

    }

}

export {VehicleScanTask}
