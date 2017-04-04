import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {KafkaController} from "./kafka-controller";
import {VehicleMessage} from "../../core/message/vehicle-message";

class Command {
    public name: string;
    public params: Array<number>
}

class KafkaVehicleController {

    private _vehicle: Vehicle;
    private _kafka: KafkaController;
    private _running = false;
    private _consumer: (message: any) => any;
    private _producer: (message: VehicleMessage) => any;

    constructor(vehicle: Vehicle) {
        this._vehicle = vehicle;
        this._kafka = new KafkaController();
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
        try {
            switch (command.name) {
                case "set-speed":
                    this._vehicle.setSpeed(command.params[0], command.params[1]);
                    break;
                case "set-offset":
                    this._vehicle.setOffset(command.params[0]);
                    break;
                case "connect":
                    this._vehicle.connect()
                        .catch(console.error);
                    break;
                case "disconnect" :
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
                    this._vehicle.brake(command.params[0]);
                    break;
                case "accelerate" :
                    this._vehicle.accelerate(command.params[0]);
                    break;
                default:
                    console.error("Unknown command: " + command.name);
            }
        } catch (e) {
            console.error("Unable to handle command: " + command);
            console.error(e);
        }
    }


}

export {KafkaVehicleController}