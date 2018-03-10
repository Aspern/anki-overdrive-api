import {IDevice} from "./IDevice";
import {Characteristic, Peripheral} from "noble";

class Device implements IDevice {

    public readonly id: string;
    public readonly address: string;
    private _peripheral: Peripheral
    private _connected: boolean;
    private _read: Characteristic
    private _write: Characteristic
    private _listeners: Array<(data: Buffer) => any>

    public constructor(id: string, address: string, peripheral: Peripheral) {
        this.id = id
        this.address = address
        this._peripheral = peripheral
        this._connected = false
        this._listeners = []
    }

    public connect(read?: string, write?: string): Promise<IDevice> {
        const self = this

        return new Promise<IDevice>((resolve, reject) => {
            self._peripheral.connect(error => {
                if(error) {
                    reject(error)
                } else {
                    self.initCharacteristics(read, write)
                        .then(() => {
                            self.enableDataListener()
                            self._connected = true
                            resolve(self)
                        })
                        .catch(reject)
                }
            })
        })
    }

    public disconnect(): Promise<IDevice> {
        const self = this

        return new Promise<IDevice>((resolve) => {
            this.removeWrite()
            this.removeRead()
            self._peripheral.disconnect(() => {
                this._listeners = []
                this._connected = false
                resolve(self)
            })
        })
    }

    public read(listener: (data: Buffer) => any) {
        this._listeners.push(listener)
    }

    public write(data: Buffer): Promise<void> {
        const self = this

        return new Promise<void>((resolve, reject) => {
            self._write.write(data, false, error => {
                if(error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }

    private initCharacteristics(read?: string, write?: string): Promise<void> {
        const self = this

        return new Promise<void>((resolve, reject) => {
            self._peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                if (error) {
                    reject(error);
                } else {
                    characteristics.forEach(characteristic => {
                        if(read && characteristic.uuid === read) {
                            self._read = characteristic
                        } else if(write && characteristic.uuid === write) {
                            self._write = characteristic
                        }
                    })

                    if(read && !self._read) {
                        reject("Could not initialize read characteristic.")
                    } else if(write && !self._write) {
                        reject("Could not initialize write characteristic.")
                    } else {
                        resolve();
                    }
                }
            })

        })
    }

    private enableDataListener(): void {
        const self = this

        this._read.subscribe()
        this._read.on("data", (data: Buffer) => {
            self._listeners.forEach(listener => listener(data))
        })
    }

    private removeWrite(): void {
        delete this._write
    }

    private removeRead(): void {
        const self = this

        this._listeners.forEach(listener => {
            self._read.removeListener("data", listener)
        })
        this._read.unsubscribe()
        delete this._read
    }

}

export {Device}