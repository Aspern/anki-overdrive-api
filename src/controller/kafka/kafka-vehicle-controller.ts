import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {KafkaController} from "./kafka-controller";
import {VehicleMessage} from "../../core/message/vehicle-message";
import * as log4js from "log4js";

class Command {
    public name: string;
    public timestamp: Date;
    public params: Array<number>
}

class KafkaVehicleController {

    private _vehicle: Vehicle;
    private _kafka: KafkaController;
    private _running = false;
    private _consumer: (message: any) => any;
    private _producer: (message: VehicleMessage) => any;
    private _latencies: Array<number> = [];
    private _logger: log4js.Logger;

    constructor(vehicle: Vehicle) {
        this._vehicle = vehicle;
        this._kafka = new KafkaController();
        this._logger = log4js.getLogger("controller-" + vehicle.id);
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            try {
                if (me._running) {
                    reject(new Error("Controller is already running."));
                } else {
                    me._consumer = (message: any) => {
                        let command = JSON.parse(message.value);
                        me.handleCommand(command);
                    };
                    me._producer = (message: VehicleMessage) => {
                        me._kafka.sendPayload([{
                            topic: "cardata-raw",
                            partitions: 1,
                            messages: JSON.stringify(message).replace(/_/g, "")
                        }]);
                    };

                    me._kafka.addListener(me._consumer);
                    me._kafka.initializeConsumer([{topic: this._vehicle.id, partition: 0}], 0);
                    me._kafka.initializeProducer().then(online => {
                        if (!online)
                            reject(new Error("Kafka Server is offline."));
                        else {
                            me._vehicle.addListener(me._producer);
                            me._running = true;
                            resolve();
                        }
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            if (!me._running) {
                reject("Controller is not running.");
            } else {
                me._vehicle.removeListener(me._producer);
                me._kafka.removeListener(me._consumer);
                me._running = false;
                resolve();
            }
        });
    }

    private handleCommand(command: Command) {
        let logger = this._logger;

        try {
            switch (command.name) {
                case "set-speed":
                    this._vehicle.setSpeed(command.params[0], command.params[1]);
                    break;
                case "set-offset":
                    this._vehicle.setOffset(command.params[0]);
                    break;
                case "connect":
                    if (!this._vehicle.connected)
                        this._vehicle.connect()
                            .catch(console.error);
                    break;
                case "disconnect" :
                    if (this._vehicle.connected)
                        this._vehicle.disconnect()
                            .catch(console.error);
                    break;
                case "change-lane":
                    this._vehicle.changeLane(command.params[0]);
                    break;
                case "u-turn":
                    this._vehicle.uTurn();
                    break;
                case "brake":
                    logger.info("brake [" + command.params[0] + ", " + command.params[1] + "].");
                    this._latencies.push(new Date().getMilliseconds() - new Date(command.timestamp).getMilliseconds());
                    this._vehicle.brake(command.params[0], command.params[1]);
                    break;
                case "accelerate" :
                    logger.info("accelerate [" + command.params[0] + ", " + command.params[1] + "].");
                    this._latencies.push(new Date().getMilliseconds() - new Date(command.timestamp).getMilliseconds());
                    this._vehicle.accelerate(command.params[0], command.params[1]);
                    break;
                default:
                    logger.error("Unknown command [" + command.name + "]");
            }
        } catch (error) {
            logger.error("Cannot handle command " + JSON.stringify(command), error);
        }
    }

    public printLatencies() {
        let logger = this._logger;

        logger.info("Latencies for " + this._vehicle.id);
        this._latencies.forEach(latency => {
            logger.info(""+latency);
        });
    }

    public avgLatencies() {
        console.log("Avg Latencies for " + this._vehicle.id);
        let sum = 0;
        this._latencies.forEach(latency => {
            sum += latency;
        });
        console.log(sum / this._latencies.length);
    }

    public medianLatencies() {
        console.log("Median Latencies for " + this._vehicle.id);
        this._latencies.sort((a, b) => a - b);
        console.log(this._latencies[Math.round(this._latencies.length / 2)]);
    }

    public clearLatencies() {
        this._latencies = [];
        console.log("Cleared latencies for " + this._vehicle.id);
    }

}

export {KafkaVehicleController}