interface BleDevice {

    startScanning(): Promise<void>

    stopScanning(): Promise<void>
}

export {BleDevice}
