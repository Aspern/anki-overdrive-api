import {IDevice} from "../../lib/ble/IDevice";
import {ANKI_STR_SERVICE_UUID} from "../../lib/message/GattProfile";

class DeviceMock implements IDevice {

    public readonly id: string
    public readonly address: string
    public  data: Buffer
    private _serviceId: string
    private _listeners: Array<(data: Buffer) => any>

    public constructor(id = "", address = "", serviceId = ANKI_STR_SERVICE_UUID) {
        this.id = id
        this.address = address
        this._serviceId = serviceId
        this._listeners = []
    }

    public connect(): Promise<IDevice> {
        return new Promise<IDevice>(resolve => {
            resolve(this)
        })
    }

    public disconnect(): Promise<IDevice> {
        return new Promise<IDevice>(resolve => {
            resolve(this)
        })
    }

    public validate(serviceId: string): Promise<boolean> {
        const self = this

        return new Promise<boolean>(resolve => {
            resolve(serviceId === self._serviceId)
        });
    }

    public read(listener: (data: Buffer) => any): any {
        this._listeners.push(listener)
    }

    public write(data: Buffer): Promise<void> {
       const self = this

       return new Promise<void>((resolve) => {
           self.data = data
           resolve()
       })
    }

    public triggerRead(data: Buffer): void {
        this._listeners.forEach(listener => listener(data))
    }

}

export {DeviceMock}