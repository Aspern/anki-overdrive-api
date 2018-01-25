import {IBluetooth, State} from "../../lib/ble/IBluetooth";
import {IDevice} from "../../lib/ble/IDevice";

class BluetoothMock implements IBluetooth {

    public onDiscover: (device: IDevice) => any;
    public onError: (error: any) => any;
    public state: State;
    public readonly timeout: number;

    private _devices: IDevice[]

    public constructor(devices: IDevice[] = []) {
        this._devices = devices
        this.timeout = 1000
    }

    public startScanning(): Promise<void> {
        const self = this

        return new Promise<void>(resolve => {
            self.state = "poweredOn"
            this._devices.forEach(self.onDiscover)
            resolve()
        })
    }

    public stopScanning(): Promise<void> {
        const self = this

        return new Promise<void>(resolve => {
            self.state = "disconnected"
            resolve()
        })
    }

    public throwError(error: Error) {
        this.onError(error)
    }
}

export {BluetoothMock}