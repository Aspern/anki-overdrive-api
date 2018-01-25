import {BleDevice} from "./IBluetooth";
import {injectable} from "inversify";
import * as noble from "noble";
import {AnkiOverdriveVehicleScanner} from "../vehicle/anki-overdrive-vehicle-scanner";

@injectable()
class NobleBleDevice implements BleDevice {

    private _timeout: 5000
    private _retries: 3

    public startScanning(): void {
        noble.startScanning()
        noble.on("discover", listener)
    }

    public stopScanning(): void{
        noble.stopScanning()
        noble.removeListener();
    }

    private onDiscover

    private enableBluetooth(): Promise<void> {
        const me = this
        let counter = 0
        let interval: any

        return new Promise<void>((resolve, reject) => {
            interval = setInterval(() => {

                if (noble.state === "poweredOn") {
                    clearInterval(interval)
                    resolve(me)
                }

                if (counter === me.retries) {
                    clearInterval(interval)
                    return reject("BLE Adapter is offline.")
                }

                ++counter
            }, this.timeout)
        })
    }

}