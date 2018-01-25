import {IDevice} from "../../lib/ble/IDevice";
import {ANKI_STR_SERVICE_UUID} from "../../lib/message/constants";

class DeviceMock implements IDevice {

    public readonly id: string
    public readonly address: string
    private _serviceId: string

    public constructor(id = "", address = "", serviceId = ANKI_STR_SERVICE_UUID) {
        this.id = id
        this.address = address
        this._serviceId = serviceId
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

}

export {DeviceMock}