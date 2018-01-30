import {IDevice} from "../../lib/ble/IDevice";
import {ANKI_STR_SERVICE_UUID} from "../../lib/message/GattProfile";

class DeviceMock implements IDevice {

    public readonly id: string
    public readonly address: string
    public  data: Buffer
    private _serviceId: string
    private _listeners: Array<(data: Buffer) => any>
    private _responses = new Map<number, Buffer>()

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
           self._responses.forEach((value, key) => {
              const messageId = data.readUInt8(1)
              if(messageId === key) {
                  self._listeners.forEach(listener => listener(value))
              }
           })
           resolve()
       })
    }

    public triggerRead(data: Buffer): void {
        this._listeners.forEach(listener => listener(data))
    }

    public registerResponse(id: number, message: Buffer): DeviceMock {
        this._responses.set(id, message)
        return this
    }

}

export {DeviceMock}