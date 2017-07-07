import * as log4js from "log4js";
import {Logger} from "log4js";
import {DataPipeline} from "../component/data-pipleine";
import {DataFilter} from "../component/data-filter";
import {DataSender} from "../component/data-sender";
import {VehicleMessage} from "../../../core/message/vehicle-message";
import {isNullOrUndefined} from "util";
import {VehicleDataReceiver} from "./vehicle-data-receiver";
import {Vehicle} from "../core/vehicle/vehicle-interface";

class VehiclePipeline implements DataPipeline {

    private _filters: Array<DataFilter<VehicleMessage, VehicleMessage>> = [];
    private _receiver: VehicleDataReceiver;
    private _sender: DataSender<VehicleMessage>;
    private _logger: Logger;

    constructor() {
      this._logger = log4js.getLogger("vehcile-pipeline");
    }

    addFilter(filter: DataFilter<VehicleMessage, VehicleMessage>, index = -1): void {
        if (index >= 0) {
            this._filters.splice(index, 0, filter);
        } else {
            this._filters.push(filter);
        }
    }

    setReceiver(receiver: VehicleDataReceiver): void {
        this._receiver = receiver;
    }

    setSender(sender: DataSender<VehicleMessage>): void {
        this._sender = sender;
    }

    start(): Promise<void> {
        let me = this,
            sender = this._sender,
            receiver = this._receiver,
            filters = me._filters;

        return new Promise<void>((resolve, reject) => {
            if (isNullOrUndefined(sender)) {
                reject("DataSender is null or undefined.");
            } else if (isNullOrUndefined(receiver)) {
                reject("DataReceiver is null or undefined.");
            } else {
                receiver.receive(message => {
                    for (let i = 0; i < filters.length; i++) {
                        message = filters[i].filter(message);
                    }
                    sender.send(message);
                });
                receiver.start().then(() => {
                    sender.start().then(() => {
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            }
        });
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._receiver.stop()
                    .then(() => {
                        this._sender.stop()
                            .then(() => {
                                resolve();
                            }).catch(reject)
                    }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    updateVehicles(vehicles :Array<Vehicle>) : void {
        if(!isNullOrUndefined(this._receiver)) {
            this._receiver.updateVehicles(vehicles);
        } else {

        }
    }
}

export {VehiclePipeline};