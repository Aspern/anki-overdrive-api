import * as noble from "noble"
import {Peripheral} from "noble";
import {ANKI_STR_SERVICE_UUID} from "../message/constants";
import {isNullOrUndefined} from "util";
import {Vehicle} from "./vehicle";
import {VehicleScanner} from "./vehicle-scanner";
import {AnkiOverdriveVehicle} from "./anki-overdrive-vehicle";

class AnkiOverdriveVehicleScanner implements VehicleScanner {

    public readonly retries: number
    public readonly timeout: number

    constructor(timeout = 1000, retries = 3) {
        this.retries = retries
        this.timeout = timeout
    }

    public findAll(): Promise<Vehicle[]> {
        return new Promise<Vehicle[]>((resolve, reject) => {
            this.enableBluetooth()
                .then(this.scanPeripherals)
                .then(this.validatePeripherals)
                .then(this.mapVehicles)
                .then(resolve)
                .catch(reject)
        })
    }

    public findById(id: string): Promise<Vehicle> {
        return new Promise<Vehicle>((resolve => resolve(undefined)));
    }

    public findByAddress(address: string): Promise<Vehicle> {
        return new Promise<Vehicle>((resolve => resolve(undefined)));
    }

    public findAny(): Promise<Vehicle> {
        return new Promise<Vehicle>((resolve => resolve(undefined)));
    }

    private enableBluetooth(): Promise<AnkiOverdriveVehicleScanner> {
        const me = this
        let counter = 0
        let interval: any

        return new Promise<AnkiOverdriveVehicleScanner>((resolve, reject) => {
            interval = setInterval(() => {

                if (noble.state === "poweredOn") {
                    clearInterval(interval)
                    resolve(me)
                }

                if (counter === me.retries) {
                    clearInterval(interval)
                    return reject("BLE Adapter is offline.")
                }

                ++counter
            }, this.timeout)
        })
    }

    private scanPeripherals(scanner: AnkiOverdriveVehicleScanner): Promise<Peripheral[]> {
        const peripherals: Peripheral[] = []
        const listener = (peripheral: Peripheral) => peripherals.push(peripheral)

        return new Promise<Peripheral[]>(resolve => {
            noble.startScanning()
            noble.on("discover", listener)

            setTimeout(() => {
                noble.stopScanning()
                noble.removeListener("discover", listener)

                resolve(peripherals)
            }, scanner.timeout)
        })
    }

    private validatePeripherals(peripherals: Peripheral[]): Promise<Peripheral[]> {
        const validatedPeripherals: Peripheral[] = []

        return new Promise<Peripheral[]>((resolve, reject) => {

            peripherals.reduce((promise, peripheral) => {
                return promise.then((validated: Peripheral[]) => {
                    return new Promise<Peripheral[]>(r  => {

                        peripheral.connect(error => {
                            if(!isNullOrUndefined(error)) {
                                return reject(error)
                            }
                            return peripheral.discoverAllServicesAndCharacteristics((error2, services) => {
                                if (!isNullOrUndefined(error2)) {
                                    peripheral.disconnect(() => reject(error2))
                                }
                                services.forEach(service => {
                                    if (service.uuid === ANKI_STR_SERVICE_UUID) {
                                        validated.push(peripheral)
                                    }
                                })
                                peripheral.disconnect()
                                resolve(validated)
                            })
                        })
                    }).then(val =>  val)
                })
            }, Promise.resolve(validatedPeripherals))
                .then(resolve)
        })
    }

    private mapVehicles(peripherals: Peripheral[]): Promise<Vehicle[]> {
        return new Promise<Vehicle[]>(resolve => {
            resolve(
                peripherals.map(peripheral => new AnkiOverdriveVehicle(peripheral))
            )
        })
    }
}

export {AnkiOverdriveVehicleScanner}