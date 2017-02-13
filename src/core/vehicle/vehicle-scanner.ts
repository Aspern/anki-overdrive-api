/// <reference path="../../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Peripheral} from "noble";
import {Vehicle} from "./vehicle-interface";
import {AnkiOverdriveVehicle} from "./anki-overdrive-vehicle";

class VehicleScanner {

    private timeout: number;
    private retries: number;

    constructor(timeout?: number, retries?: number) {
        this.timeout = timeout || 1000;
        this.retries = retries || 3;
    }

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

    findById(id: string): Promise<Vehicle> {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                vehicles.forEach((vehicle: AnkiOverdriveVehicle) => {
                    if (vehicle.id === id)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with id [" + id + "]."));
            }).catch(reject);
        });
    }

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