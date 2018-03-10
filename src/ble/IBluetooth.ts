import {IDevice} from "./IDevice";

type State = ("poweredOn"|"disconnected"|"error"|"unknown")

/**
 * Represents the bluetooth of the current environment
 *
 * @since 1.0.0
 */
interface IBluetooth {

    /**
     * Callback if a device is discovered.
     *
     * @param device Bluetooth device
     */
    onDiscover: (device: IDevice) => any

    /**
     * Callback if an error raises while the discovery process.
     *
     * @param error Discovery error
     */
    onError: (error: any) => any

    /**
     * Current state of the bluetooth adapter.
     */
    state: State

    /**
     * Timeout for discovery process.
     */
    timeout: number

    /**
     * Starts the discovery process of the bluetooth adapter. executes the [[onDiscover]] callback
     * if a new device is detected or executes the [[onError]] callback if any errors occurs from the bluetooth
     * device.
     * Returns a promise that resolves after the discovery process is started or rejects if the process can not be
     * started successfully.
     *
     * @param serviceUUIDS
     * @returns State after discovery process
     */
    startScanning(serviceUUIDS?: string[]): Promise<void>

    /**
     * Stops the discovery Process. Returns a promise that resolves after the process is stopped successfully or
     * rejects if the process can not be stopped orderly.
     *
     * @returns State after stopping the discovery process
     */
    stopScanning(): Promise<void>
}

export {State, IBluetooth}
