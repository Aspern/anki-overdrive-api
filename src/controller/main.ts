import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {AnkiConsole} from "./console";
import {PositionUpdateMessage} from "../core/message/position-update-message";
import {KafkaController} from "./kafka/kafkacontroller";
import {ConsumerMessage} from "./kafka/ConsumerMessage";

let vehicles: Array<Vehicle>;

console.log("scanning vehicles...");

let scanner = new VehicleScanner();
let ankiConsole = new AnkiConsole();

let kafka = new KafkaController('192.168.2.111:2181');

let canSend: boolean;

kafka.initializeProducer().then((isStarted: boolean)=> {
    canSend = isStarted;
});

scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    ankiConsole.initializePrompt(vehicles);

    vehicles[0].addListener((message) => {
        console.log(message);
        canSend ? kafka.sendPayload([ { topic: 'cartest', messages: message , partitions: 1 }]): console.log('not started');
    }, PositionUpdateMessage);
});

kafka.addListener((message: any) => {
    console.log(message);
}, ConsumerMessage);

kafka.initializeConsumer([{ topic: 'test', partition: 0 }]);






