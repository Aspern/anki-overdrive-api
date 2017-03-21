import {SimpleDistanceFilter} from "../../core/filter/simple-distance-filter";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Track} from "../../core/track/track-interface";
import {KafkaController} from "./kafka-controller";
import {unescape} from "querystring";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import {Distance} from "../../core/filter/distance";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {isNullOrUndefined} from "util";

class KafkaDistanceFilter {

    private _filter: SimpleDistanceFilter;
    private _kafka: KafkaController;
    private _running = false;
    private _store: {[key: string]: PositionUpdateMessage} = {};
    private _updateHandler: {scope: any, handler: (message: VehicleMessage) => any};

    constructor(vehicles: Array<Vehicle>, track: Track) {
        this._filter = new SimpleDistanceFilter();
        this._filter.init([track, vehicles]);
        this._kafka = new KafkaController();
    }

    registerUpdateHandler(handler: (message: VehicleMessage) => any, scope?: any) {
        if (isNullOrUndefined(scope))
            scope = this;

        this._updateHandler = {scope: scope, handler: handler};
    }

    unregisterUpdateHandler() {
        this._updateHandler = null;
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me._kafka.initializeProducer().then(online => {
                    if (me._running) {
                        reject(new Error("KafkaDistanceFilter is already running."));
                    } else if (!online) {
                        reject(new Error("Kafka Server is offline."));
                    } else {
                        me._filter.onUpdate(output => {
                            me._kafka.sendPayload([{
                                topic: "cardata-filtered",
                                key: output.messageId.toString(),
                                partitions: 1,
                                messages: JSON.stringify(output, (key, value) => {
                                    if (key === '_data')
                                        return undefined;
                                    return value;
                                }).replace(/_/g, "")
                            }]);


                            if (output instanceof PositionUpdateMessage) {
                                let distances: Array<Distance> = [];
                                for (let key in me._store) {
                                    if (me._store.hasOwnProperty(key)) {
                                        let message = me._store[key];
                                        distances = distances.concat(message.distances);
                                    }
                                }

                                let data = {
                                    timestamp: new Date(),
                                    messageId: 4711,
                                    mergedDistances: distances
                                };

                                me._kafka.sendPayload([{
                                    topic: "cardata-filtered",
                                    partitions: 1,
                                    messages: JSON.stringify(data).replace(/_/g, "")
                                }]);

                                me._store[output.vehicleId] = output;
                            }

                            if (!isNullOrUndefined(me._updateHandler)) {
                                me._updateHandler.handler.call(me._updateHandler.scope, output, me._updateHandler.scope);
                            }
                        });

                        me._filter.start()
                            .then(() => {
                                me._running = true;
                                resolve();
                            })
                            .catch(reject);
                    }
                }
            );
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            if (!me._running) {
                reject(new Error("KafkaDistanceFilter is not running."));
            } else {
                me._filter.stop().then(() => {
                    me._running = false;
                    resolve();
                }).catch(reject);
            }
        });
    }

}

export {KafkaDistanceFilter};