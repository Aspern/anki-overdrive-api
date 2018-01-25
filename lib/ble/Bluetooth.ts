import {IBluetooth, State} from "./IBluetooth";
import * as noble from "noble";
import {Peripheral} from "noble";
import {IDevice} from "./IDevice";
import {Device} from "./Device";

class Bluetooth implements IBluetooth {

    private _onDiscover: (device: IDevice) => any
    private _onError: (error: any) => any
    private _state: State = "unknown"
    private _timeout: number
    private _retries = 3

    public constructor(onDiscover: (device: IDevice) => any = () => {},
                       onError = () => {},
                       timeout = 1000) {
        this._onDiscover = onDiscover
        this._onError = onError
        this._timeout = timeout
    }

    public startScanning(): Promise<void> {
        const self = this

        return new Promise<void>((resolve, reject) => {
            self.enableAdapter().then(() => {
                noble.startScanning()
                noble.on("discover", self.publishDevice)
                noble.on("error", self._onError)
                resolve()
            }).catch(reject)
        })
    }

    public stopScanning(): Promise<void> {
        const self = this

        return new Promise<void>((resolve, reject) => {
            if(self._state === "poweredOn") {
                noble.stopScanning()
                noble.removeListener("discover", this._onDiscover)
                noble.removeListener("error", this._onError)
                this._state = "disconnected"
                resolve()
            } else {
                reject(new Error("Bluetooth is still offline."))
            }
        })
    }

    set onDiscover(callback: (device: IDevice) => any) {
        this._onDiscover = callback
    }

    set onError(callback: (error: any) => any) {
        this._onError = callback
    }

    set timeout(timeout: number) {
        this._timeout = timeout
    }

    get timeout(): number {
        return this._timeout
    }

    get state(): State {
        return this._state
    }

    private publishDevice(peripheral: Peripheral): void {
        this._onDiscover(new Device(
            peripheral.id,
            peripheral.address,
            peripheral
        ))
    }

    private enableAdapter(): Promise<void> {
        const self = this
        let interval: any
        let counter = 0

        return new Promise<void>((resolve, reject) => {
            interval = setInterval(() => {
                if (noble.state === "poweredOn") {
                    clearInterval(interval)
                    self._state = "poweredOn"
                    resolve()
                }
                if (counter === self._retries) {
                    clearInterval(interval)
                    self._state = "disconnected"
                    reject(new Error("Bluetooth is offline."))
                }
                ++counter
            }, this._timeout)
        })
    }
}

export {Bluetooth}