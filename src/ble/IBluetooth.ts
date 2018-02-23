
import {IDevice} from "./IDevice";

type State = ("poweredOn"|"disconnected"|"error"|"unknown")

interface IBluetooth {

    onDiscover: (device: IDevice) => any
    onError: (error: any) => any
    state: State
    timeout: number

    startScanning(serviceUUIDS?: string[]): Promise<void>

    stopScanning(): Promise<void>
}

export {State, IBluetooth}
