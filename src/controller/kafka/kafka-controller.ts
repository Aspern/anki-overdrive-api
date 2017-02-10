import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {AnkiConsole} from "../console";
import {KafkaController} from "./kafkacontroller";
import {PositionUpdateMessage} from "../../core/message/position-update-message";

let scanner = new VehicleScanner(),
    ankiConsole = new AnkiConsole(),
    kafka = new KafkaController('localhost:2181');


kafka.initializeProducer().then(running => {
    if (!running) {
        console.warn("Kafka is not running @localhost:2181");
        process.exit(0);
    }

    scanner.findAll().then(vehicles => {

        vehicles.forEach(vehicle => {
            vehicle.addListener((message: PositionUpdateMessage) => {
                kafka.sendPayload([
                    {
                        topic: 'cardata',
                        partitions: 1,
                        messages: JSON.stringify(message).replace(/_/g, "")
                    }
                ])
            }, PositionUpdateMessage);
        });

        ankiConsole.initializePrompt(vehicles);

    }).catch(e => {
        console.error(e);
        process.exit(0);
    });

})

