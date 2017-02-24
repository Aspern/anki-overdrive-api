import {SimpleDistanceFilter} from "../../core/filter/simple-distance-filter";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Track} from "../../core/track/track-interface";
import {KafkaController} from "./kafka-controller";

class KafkaDistanceFilter {

    private _filter: SimpleDistanceFilter;
    private _kafka: KafkaController;
    private _running = false;

    constructor(vehicles: Array<Vehicle>, track: Track) {
        this._filter = new SimpleDistanceFilter();
        this._filter.init([track, vehicles]);
        this._kafka = new KafkaController();
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
                                partitions: 1,
                                messages: JSON.stringify(output).replace(/_/g, "")
                            }]);
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