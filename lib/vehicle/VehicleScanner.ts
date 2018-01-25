import {IVehicleScanner} from "./IVehicleScanner";
import {IBluetooth} from "../ble/IBluetooth";
import {Bluetooth} from "../ble/Bluetooth";
import {Vehicle} from "./vehicle";
import {Peripheral} from "noble";
import {Logger} from "log4js";
import * as log4js from "log4js"
import {ANKI_STR_SERVICE_UUID} from "../message/constants";
import {AnkiOverdriveVehicle} from "./anki-overdrive-vehicle";
import {IDevice} from "../ble/IDevice";

class AnkiOverdriveVehicleScanner implements IVehicleScanner {

    private readonly _bluetooth: IBluetooth
    private _vehicles: Vehicle[]
    private _logger: Logger

    constructor(bluetooth?: IBluetooth) {
        if(!bluetooth) {
            this._bluetooth = new Bluetooth()
        }
        this._bluetooth.onDiscover = this.onDiscover
        this._bluetooth.onError = this.onError
        this._logger = log4js.getLogger()
    }

    public findAll(timeout = 3000): Promise<Vehicle[]> {
        const self = this
        this._vehicles = []

        return new Promise<Vehicle[]>((resolve, reject) => {
            self._bluetooth.startScanning()
                .then(() => self.awaitScanning(timeout))
                .then(resolve)
                .catch(reject)
        })
    }

    public findById(id: string, timeout = 3000): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self.findAll(timeout)
                .then(vehicles => resolve(vehicles.find(
                    vehicle => vehicle.id === id)))
                .catch(reject)
        })
    }

    public findByAddress(address: string, timeout = 3000): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self.findAll(timeout)
                .then(vehicles => resolve(vehicles.find(
                    vehicle => vehicle.address === address)))
                .catch(reject)
        })
    }

    public findAny(timeout = 3000): Promise<Vehicle> {
        const self = this

        return new Promise<Vehicle>((resolve, reject) => {
            self.findAll(timeout)
                .then(vehicles => resolve(vehicles.pop()))
                .catch(reject)
        })
    }

    private onDiscover(device: IDevice): void {
        const self = this

        device.connect()
            .then(() => device.validate(ANKI_STR_SERVICE_UUID))
            .then(valid => {
                if(valid) {
                    self._vehicles.push(new AnkiOverdriveVehicle(device))
                }
                device.disconnect()
                    .then()
                    .catch(self.onError)
            })
    }

    private onError(error: any): void {
        this._logger.error(error)
    }

    private awaitScanning(timeout: number): Promise<Vehicle[]> {
        const self = this

        return new Promise<Vehicle[]>((resolve, reject) => {
            setTimeout(() => {
                self._bluetooth.stopScanning()
                    .then(() => resolve(self._vehicles))
                    .catch(reject)
            }, timeout)
        })
    }

}

export {AnkiOverdriveVehicleScanner}