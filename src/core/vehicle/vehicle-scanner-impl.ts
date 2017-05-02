/// <reference path="../../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Peripheral} from "noble";
import {Vehicle} from "./vehicle-interface";
import {AnkiOverdriveVehicle} from "./vehicle-impl";
import {isNullOrUndefined} from "util";
import {Setup} from "../setup";
import {VehicleScanner} from "./vehicle-scanner-interface";


class VehicleScannerImpl implements VehicleScanner {

    private _timeout: number;
    private _retries: number;
    private _setup: Setup;

    /**
     * Creates an instance of VehicleScannerImpl.
     *
     * @param setup Setup that belongs to the track and vehicles.
     * @param timeout (optional) number of milliseconds before timeout is reached, default is
     * 1 second.
     * @param retries (optional) number of retries before searching fails, default is 3.
     */
    constructor(setup: Setup, timeout = 1000, retries = 3) {
        this._setup = setup;
        this._timeout = timeout;
        this._retries = retries;
    }

    findAll(): Promise<Array<Vehicle>> {
        let vehicles: Array<Vehicle> = [],
            peripherals: Array<Peripheral> = [],
            vehiclePeripherals: Array<Peripheral> = [],
            me = this;

        return new Promise<Array<Vehicle>>((resolve, reject) => {
            me.onAdapterOnline().then(() => {
                let callback = (peripheral: Peripheral) => {
                    peripherals.push(peripheral);
                };

                noble.startScanning();
                noble.on('discover', callback);

                // Wait until timeout, then stop scanning.
                setTimeout(() => {
                    noble.stopScanning();
                    noble.removeListener('discover', callback);
                    peripherals.forEach(peripheral => {
                        if (me.isVehicleInSetup(peripheral))
                            peripheral.connect((e: Error) => {
                                if (!isNullOrUndefined(e)) {
                                    peripheral.disconnect(() => {
                                        reject(e);
                                    });
                                } else {
                                    peripheral.discoverAllServicesAndCharacteristics((e, services) => {
                                        if (isNullOrUndefined(e) && !isNullOrUndefined(services))
                                            for (let i = 0; i < services.length; i++) {
                                                if (services[i].uuid === "be15beef6186407e83810bd89c4d8df4") {
                                                    vehiclePeripherals.push(peripheral);
                                                    break;
                                                }
                                            }

                                        peripheral.disconnect();
                                    });
                                }
                            });
                    });
                    setTimeout(() => {
                        vehiclePeripherals.forEach((vehcPer) => {
                            vehicles.push(new AnkiOverdriveVehicle(vehcPer, me._setup));
                        });
                        resolve(vehicles);
                    }, me._timeout);
                }, this._timeout);
            }).catch(reject);
        });
    }

    findById(id: string): Promise<Vehicle|null> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                vehicles.forEach((vehicle: AnkiOverdriveVehicle) => {
                    if (vehicle.id === id)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with messageId [" + id + "]."));
            }).catch(reject);
        });
    }

    findByAddress(address: string): Promise<Vehicle|null> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                vehicles.forEach((vehicle: AnkiOverdriveVehicle) => {
                    if (vehicle.address === address)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with address [" + address + "]."));
            }).catch(reject);
        });
    }

    findAny(): Promise<Vehicle|null> {
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


    /**
     * Proofs if the peripheral is part of the current setup.
     *
     * @param peripheral Bluetooth Low Energy peripheral
     * @return 'true' if vehicle is in setup or 'false' if not
     */
    private isVehicleInSetup(peripheral: Peripheral): boolean {
        let me = this,
            vehiclesInSetup = me._setup.vehicles,
            i = 0;
        for (; i < vehiclesInSetup.length; i++) {
            if (vehiclesInSetup[i].uuid === peripheral.uuid)
                return true;
        }

        return false;
    }

    /**
     * Resolves, if the Bluetooth Low Energy adapter is online.
     */
    private onAdapterOnline(): Promise<void> {
        let counter: number = 0,
            me = this;

        return new Promise<void>((resolve, reject) => {
            let i = setInterval(() => {
                if (noble.state === "poweredOn") {
                    clearInterval(i);
                    resolve();
                }

                if (counter === me._retries) {
                    clearInterval(i);
                    return reject("BLE Adapter offline");
                }

                ++counter;
            }, this._timeout);
        });
    }
}

export {VehicleScannerImpl};