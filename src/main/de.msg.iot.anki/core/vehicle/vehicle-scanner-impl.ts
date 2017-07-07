/// <reference path="../../../../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Peripheral} from "noble";
import {Vehicle} from "./vehicle-interface";
import {VehicleImpl} from "./vehicle-impl";
import {VehicleScanner} from "./vehicle-scanner-interface";
import {SetupConfig} from "../settings/setup-config";

/**
 * VehicleScanner implementation using the noble.js library.
 */
class VehicleScannerImpl implements VehicleScanner {

    private _timeout: number;
    private _retries: number;
    private _setup: SetupConfig;

    /**
     * Creates instance of VehicleScanner.
     *
     * @param setup Config, that provides information about this setup
     * @param timeout (optional) Timeout for searching for vehicles.
     * @param retries (optional) Number of retries to search for vehicles.
     */
    constructor(setup: SetupConfig, timeout = 1000, retries = 3) {
        this._setup = setup;
        this._timeout = timeout;
        this._retries = retries;
    }

    findAll(): Promise<Array<Vehicle>> {
        let me = this,
            setup = this._setup,
            vehicles: Array<Vehicle> = [];

        return new Promise<Array<Vehicle>>((resolve, reject) => {
            me.enableAdapter()
                .then(me.scanPeripherals)
                .then(peripherals => {
                    peripherals.forEach(peripheral => vehicles.push(
                        new VehicleImpl(peripheral, setup)
                    ));
                    resolve(vehicles);
                })
                .catch(reject);
        });
    }


    findById(id: string): Promise<Vehicle> {
        let me = this;
        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then(vehicles => {
                vehicles.forEach((vehicle: Vehicle) => {
                    if (vehicle.id === id)
                        return resolve(vehicle);
                });
                reject(new Error("Found no vehicle with id [" + id + "]."));
            }).catch(reject);
        });
    }

    findByAddress(address: string): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                vehicles.forEach((vehicle: VehicleImpl) => {
                    if (vehicle.address === address)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with address [" + address + "]."));
            }).catch(reject);
        });
    }

    findAny(): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                if (vehicles.length > 0)
                    resolve(vehicles[0]);
                else
                    reject(new Error("Found no vehicle in BLE network."));
            }).catch(reject);
        });
    }

    private enableAdapter(): Promise<number> {
        let counter: number = 0,
            me = this;

        return new Promise<number>((resolve, reject) => {
            let task = setInterval(() => {
                if (noble.state === "poweredOn") {
                    clearInterval(task);
                    resolve(me._timeout);
                }

                if (counter === me._retries) {
                    clearInterval(task);
                    return reject("BLE Adapter is offline.");
                }

                ++counter;
            }, 1000);
        });
    }

    private scanPeripherals(timeout: number): Promise<Array<Peripheral>> {
        let peripherals: Array<Peripheral> = [],
            listener = (peripheral: Peripheral) => {
                peripherals.push(peripheral);
            };

        return new Promise<Array<Peripheral>>((resolve, reject) => {
            try {
                noble.startScanning();
                noble.on('discover', listener);
            } catch (error) {
                reject(error);
            }
            setTimeout(() => {
                noble.removeListener('discover', listener);
                resolve(peripherals)
            }, timeout);
        });
    }
}

export {VehicleScannerImpl};