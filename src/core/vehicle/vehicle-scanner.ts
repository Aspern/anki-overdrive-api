/// <reference path="../../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Peripheral} from "noble";
import {Vehicle} from "./vehicle-interface";
import {AnkiOverdriveVehicle} from "./anki-overdrive-vehicle";

/**
 * Finds vehicles in the Bluetooth Low Energy (BLE) network. Vehicles can be also be found by
 * their messageId or address.
 */
class VehicleScanner {

    private timeout: number;
    private retries: number;

    /**
     * Creates a instance of VehicleScanner.
     *
     * @param timeout (optional) number of milliseconds before timeout is reached.
     * @param retries (optional) number of retries before searching fails.
     */
    constructor(timeout?: number, retries?: number) {
        this.timeout = timeout || 1000;
        this.retries = retries || 3;
    }

    /**
     * Searches and returns all available vehicles.
     *
     * @return {Promise<Array<Vehicle>>|Promise} all available vehicles
     */
    findAll(): Promise<Array<Vehicle>> {
        let vehicles: Array<Vehicle> = [],
            me = this;

        return new Promise<Array<Vehicle>>((resolve, reject) => {
            me.onAdapterOnline().then(() => {
                let callback = (peripheral: Peripheral) => {
                    vehicles.push(new AnkiOverdriveVehicle(peripheral));
                };

                noble.startScanning();
                noble.on('discover', callback);

                // Wait until timeout, then stop scanning.
                setTimeout(() => {
                    noble.stopScanning();
                    noble.removeListener('discover', callback);
                    resolve(vehicles);
                }, this.timeout);
            }).catch(reject);
        });
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

    private onAdapterOnline(): Promise<void> {
        let counter: number = 0,
            me = this;

        return new Promise<void>((resolve, reject) => {
            let i = setInterval(() => {
                if (noble.state === "poweredOn") {
                    resolve();
                    clearInterval(i);
                }

                if (counter === me.retries) {
                    reject(new Error("BLE Adapter offline"));
                    clearInterval(i);
                }

                ++counter;
            }, this.timeout);
        });


    }
}

export {VehicleScanner};