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

scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    ankiConsole.initializePrompt(vehicles);

    vehicles[0].addListener((message) => {
        console.log(message);
    }, PositionUpdateMessage);
});

let kafka = new KafkaController('localhost:2181');

kafka.addListener((message: any) => {
    console.log(message);
}, ConsumerMessage);

kafka.initializeConsumer([{ topic: 'test', partition: 0 }]);

kafka.initializeProducer().then((isStarted: boolean)=> {
    //isStarted ? kafka.sendPayload([ { topic: 'test', messages: "finally working again" , partitions: 1 }]): console.log('not started');
});



