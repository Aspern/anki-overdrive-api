import * as log4js from "log4js";
import {Logger} from "log4js";
import {DataSender} from "../component/data-sender";
import {VehicleMessage} from "../../../core/message/vehicle-message";
import {Client, HighLevelProducer} from "kafka-node";
import {JsonSettings} from "../core/settings/json-settings";
import {isNullOrUndefined} from "util";

class KafkaSender implements DataSender<VehicleMessage> {

    private _client: Client;
    private _producer: HighLevelProducer;
    private _ready = false;
    private _topic: string;
    private _logger: Logger;

    constructor() {
        let settings = new JsonSettings();

        this._client = new Client(settings.get("kafka-url"));
        this._producer = new HighLevelProducer(this._client);
        this._topic = settings.get("kafka-topic");
        this._logger = log4js.getLogger("kafka-sender");
    }

    send(data: VehicleMessage): void {
        let logger = this._logger;

        if (this._ready) {
            this._producer.send([{
                topic: this._topic,
                messages: JSON.stringify(data, (key, value) => {
                    if (key === '_data')
                        return undefined;
                    return value;
                }).replace(/_/g, "")
            }], (error => {
                if (!isNullOrUndefined(error)) {
                    logger.error("Error while producing data.", error);
                }
            }));
        }
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            try {
                let task = setTimeout(() => {
                    reject("Cannot connect to kafka-server [Timeout].");
                }, 5000);
                me._producer.on('ready', () => {
                    me._ready = true;
                    clearTimeout(task);
                    resolve();
                });
                me._producer.on('error', (error: any) => {
                    clearTimeout(task);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me._producer.close(error => {
                if (!isNullOrUndefined(error)) {
                    reject(error);
                } else {
                    me._ready = false;
                    me._client.close(() => {
                        resolve();
                    });
                }
            });
        });

    }
}

export {KafkaSender};