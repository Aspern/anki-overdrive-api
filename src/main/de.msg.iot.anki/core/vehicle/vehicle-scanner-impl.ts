/// <reference path="../../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Peripheral} from "noble";
import {Vehicle} from "../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {isNullOrUndefined} from "util";
import {Setup} from "../setup";
import {AnkiOverdriveVehicle} from "./vehicle-impl";
import {VehicleScanner} from "../../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-interface";
import {SetupConfig} from "../settings/setup-config";

/**
 * Finds vehicles in the Bluetooth Low Energy (BLE) network. Vehicles can be also be found by
 * their messageId or address.
 */
class VehicleScannerImpl implements VehicleScanner  {

    private _timeout: number;
    private _retries: number;
    private _setup: SetupConfig;

    /**
     * Creates a instance of VehicleScanner.
     *
     * @param timeout (optional) number of milliseconds before timeout is reached.
     * @param _retries (optional) number of _retries before searching fails.
     */
    constructor(setup: SetupConfig, timeout = 1000, retries = 3) {
        this._setup = setup;
        this._timeout = timeout;
        this._retries = retries;
    }

    /**
     * Searches and returns all available vehicles.
     *
     * @return {Promise<Array<Vehicle>>|Promise} all available vehicles
     */
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
                            if (!me.vehicleAlreadyExits(vehcPer, vehicles))
                                vehicles.push(new AnkiOverdriveVehicle(vehcPer, me._setup));
                        });
                        resolve(vehicles);
                    }, me._timeout);
                }, this._timeout);
            }).catch(reject);
        });
    }

    private vehicleAlreadyExits(peripheral: Peripheral, vehicles: Array<Vehicle>) {
        for (let i = 0; i < vehicles.length; i++)
            if (vehicles[i].address === peripheral.address)
                return true;
        return false;
    }

    /**
     * Searches a vehicle by its unique identifier.
     *
     * @param id Unique identifier of the vehicle
     * @return {Promise<Vehicle>|Promise} vehicle
     */
    findById(id: string): Promise<Vehicle> {
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

    /**
     * Searches a vehicle by its unique address.
     *
     * @param address unique address
     * @return {Promise<Vehicle>|Promise} vehicle
     */
    findByAddress(address: string): Promise<Vehicle> {
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

    /**
     * Searches for any vehicle.
     *
     * @return {Promise<Vehicle>|Promise} vehicle
     */
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

    private isVehicleInSetup(peripheral: Peripheral): boolean {
        let me = this,
            vehiclesInSetup = me._setup.vehicles,
            i = 0;
        for (; i < vehiclesInSetup.length; i++) {
            if (vehiclesInSetup[i].address === peripheral.address)
                return true;
        }

        return false;
    }

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