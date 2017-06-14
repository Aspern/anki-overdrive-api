import {Vehicle} from "../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {Track} from "../../main/de.msg.iot.anki/core/track/track-interface";
import {KafkaController} from "./kafka-controller";
import {RoundFilter} from "../../core/filter/round-filter";

class KafkaRoundFilter {

    private _filter: RoundFilter;
    private _kafka: KafkaController;
    private _running = false;
    private _topic: string;

    constructor(vehicle: Vehicle, track: Track, topic = "cardata-filtered") {
        this._filter = new RoundFilter();
        this._filter.init([track, vehicle]);
        this._kafka = new KafkaController();
        this._topic = topic;
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

                            let message = JSON.stringify(output, (key, value) => {
                                if (key === '_data')
                                    return undefined;
                                return value;
                            }).replace(/_/g, "");


                            me._kafka.sendPayload([{
                                topic: me._topic,
                                key: output.messageId.toString(),
                                partitions: 1,
                                messages: message
                            }]);
                        });

                        me._filter.start()
                            .then(() => {
                                me._running = true;
                                resolve();
                            }).catch(reject);
                    }
                }
            );
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            if (!me._running) {
                resolve();
            } else {
                me._filter.stop().then(() => {
                    me._running = false;
                    resolve();
                }).catch(reject);
            }
        });
    }
}

export {KafkaRoundFilter};