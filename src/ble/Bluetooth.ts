import {IBluetooth, State} from "./IBluetooth";
import * as noble from "noble";
import {IDevice} from "./IDevice";
import {Device} from "./Device";

/**
 * Bluetooth environment using noble.js.
 *
 * @since 1.0.0
 */
class Bluetooth implements IBluetooth {

    private _onDiscover: (device: IDevice) => any
    private _onError: (error: any) => any
    private _state: State = "unknown"
    private _timeout: number
    private _retries = 3

    /**
     * Creates a instance that represents a the local bluetooth environment.
     *
     * @param onDiscover Callback if device is discovered
     * @param onError Callback if error occurs
     * @param timeout Time to wait for connected bluetooth adapter
     */
    public constructor(onDiscover: (device: IDevice) => any = () => {},
                       onError = () => {},
                       timeout = 500) {
        this._onDiscover = onDiscover
        this._onError = onError
        this._timeout = timeout
    }

    /** @inheritdoc */
    public startScanning(serviceUUIDS?: string[]): Promise<void> {
        const self = this
        const uuids = serviceUUIDS || []

        return new Promise<void>((resolve, reject) => {
            self.enableAdapter().then(() => {
                noble.startScanning(uuids, false)
                noble.on("discover", (peripheral => {
                    self._onDiscover(new Device(
                        peripheral.id,
                        peripheral.address,
                        peripheral
                    ))
                }))
                noble.on("error", self._onError)
                self._state = "poweredOn"
                resolve()
            }).catch(reject)
        })
    }

    /** @inheritdoc */
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

    /**
     * Enables the local bluetooth adapter. Returns promise that resolves, if the adapter is online or rejects if
     *  * The [[_timeout]] is reached
     *  * The number of [[_retries]] is reached
     *
     * @returns State if adapter is enabled
     */
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