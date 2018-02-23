import {IVehicleScanner} from "./IVehicleScanner";
import {IBluetooth} from "../ble/IBluetooth";
import {IDevice} from "../ble/IDevice";
import {IVehicle} from "./IVehicle";
import {Vehicle} from "./Vehicle";
import {ANKI_STR_SERVICE_UUID} from "../message/GattProfile";

class VehicleScanner implements IVehicleScanner {

    private readonly _bluetooth: IBluetooth
    private _vehicles: IVehicle[]
    private _timeout: number

    constructor(bluetooth: IBluetooth, timeout = 500) {
        this._bluetooth = bluetooth
        this._bluetooth.onDiscover = this.onDiscover.bind(this)
        this._timeout = timeout
    }

    public findAll(): Promise<IVehicle[]> {
        const self = this

        return new Promise<IVehicle[]>((resolve, reject) => {
            self._vehicles = []
            self._bluetooth.startScanning([ANKI_STR_SERVICE_UUID])
                .then(() => {
                    self.awaitScanning()
                        .then(resolve)
                        .catch(reject)
                }).catch()
        })
    }

    public findById(id: string): Promise<IVehicle> {
        const self = this

        return new Promise<IVehicle>((resolve, reject) => {
            self.findAll()
                .then(vehicles => {
                    resolve(
                        vehicles.find(v => v.id === id)
                    )
                })
                .catch(reject)
        })
    }

    public findByAddress(address: string): Promise<IVehicle> {
        const self = this

        return new Promise<IVehicle>((resolve, reject) => {
            self.findAll()
                .then(vehicles => resolve(vehicles.find(
                    vehicle => vehicle.address === address)))
                .catch(reject)
        })
    }

    public findAny(): Promise<IVehicle> {
        const self = this

        return new Promise<IVehicle>((resolve, reject) => {
            self.findAll()
                .then(vehicles => resolve(vehicles.pop()))
                .catch(reject)
        })
    }

    public onError(handler: (error: any) => any) {
        this._bluetooth.onError = handler.bind(this)
    }

    public set timeout(timeout: number) {
        this._timeout = timeout
    }

    public get timeout(): number {
        return this._timeout
    }

    private onDiscover(device: IDevice): void {
        if(!this.containsVehicle(device.id)) {
            this._vehicles.push(
                new Vehicle(device)
            )
        }
    }

    private containsVehicle(id: string) {
        return this._vehicles.filter(vehicle => vehicle.id === id).length > 0
    }

    private awaitScanning(): Promise<IVehicle[]> {
        const self = this

        return new Promise<IVehicle[]>((resolve, reject) => {
            setTimeout(() => {
                self._bluetooth.stopScanning()
                    .then(() => {
                        resolve(self._vehicles)})
                    .catch(reject)
            }, self._timeout)
        })
    }

}

export {VehicleScanner}