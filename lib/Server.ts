import {IVehicleScanner} from "./vehicle/IVehicleScanner"
import {IAdapter} from "./adapter/IAdapter"
import * as log4js from "log4js"
import {Bluetooth} from "./ble/Bluetooth";
import {VehicleScanner} from "./vehicle/VehicleScanner";
import {WebsocketAdapter} from "./adapter/WebsocketAdapter";

class Server {

    private _scanner: IVehicleScanner
    private _adapters: IAdapter[] = []
    private _logger = log4js.getLogger()

    public start(): void {
        this._logger.level = "debug"
        this._logger.info("Starting server.")

        const bluetooth = new Bluetooth()
        this._scanner = new VehicleScanner(bluetooth)
        this._scanner.onError(this.onError)

        this._adapters.forEach(adapter => {
            this._logger.info("Installing adapter '" + adapter.name + "'")
            adapter.install(this._scanner)
        })
    }

    public registerAdapter(adapter: IAdapter): Server  {
        this._adapters.push(adapter)
        return this
    }

    private onError(error: any) {
        this._logger.error(error)
    }
}

new Server().registerAdapter(new WebsocketAdapter())
    .start()