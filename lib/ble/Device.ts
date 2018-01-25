import {IDevice} from "./IDevice";
import {Peripheral} from "noble";

class Device implements IDevice {

    public readonly id: string;
    public readonly address: string;
    private _peripheral: Peripheral

    public constructor(id: string, address: string, peripheral: Peripheral) {
        this.id = id
        this.address = address
        this._peripheral = peripheral
    }

    public connect(): Promise<IDevice> {
        const self = this

        return new Promise<IDevice>((resolve, reject) => {
            self._peripheral.connect(error => {
                if(error) {
                    reject(error)
                } else {
                    resolve(self)
                }
            })
        })
    }

    public disconnect(): Promise<IDevice> {
        const self = this

        return new Promise<IDevice>((resolve) => {
            self._peripheral.disconnect(() => {
                resolve(self)
            })
        })
    }

    public validate(serviceId: string): Promise<boolean> {
        const self = this

        return new Promise<boolean>((resolve, reject) => {
            self.connect().then(() => {
                self._peripheral.discoverServices([serviceId], (error, services) => {
                    if(error) {
                        reject(error)
                    } else {
                        resolve(services.length > 0)
                    }
                })
            }).catch(reject)
        });
    }

}

export {Device}