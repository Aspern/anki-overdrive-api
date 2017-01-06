/// <reference path="../../decl/noble.d.ts"/>
import * as noble from "noble";
import {Vehicle} from "./vehicle"
import {Peripheral} from "noble";

class VehicleScanner {

    private timeout: number;
    private retries: number;
    private names: Map<string, string> = new Map<string, string>();

    constructor(timeout?: number, retries?: number) {
        this.timeout = timeout || 1000;
        this.retries = retries || 3;

        this.names.set("ed0c94216553", "Skull");
        this.names.set("e42c342d466c", "Thermo");
        this.names.set("efb112b5ade2", "Freewheel");
        this.names.set("eb401ef0f82b", "Ground Shock");
    }

    findAll(): Promise<Array<Vehicle>> {
        let vehicles: Array<Vehicle> = [],
            me = this;

        return new Promise<Array<Vehicle>>((resolve, reject) => {
            me.onAdapterOnline().then(() => {
                let callback = (peripheral: Peripheral) => {
                    vehicles.push(new Vehicle(peripheral, me.nameById(peripheral.id)));
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
                vehicles.forEach((vehicle) => {
                    if (vehicle.getId() === id)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with id [" + id + "]."));
            });
        });
    }

    findByAddress(address: string) {
        let me = this;

        return new Promise<Vehicle>((resolve, reject) => {
            me.findAll().then((vehicles) => {
                vehicles.forEach((vehicle) => {
                    if (vehicle.getAdddress() === address)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with address [" + address + "]."));
            });
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

    private nameById(uuid: string): string {
        if (!this.names)
            return uuid;

        return this.names.get(uuid) || uuid;
    }
}

export {VehicleScanner};