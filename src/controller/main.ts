import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";
import {KafkaController} from "./kafka/kafkacontroller";
import {ConsumerMessage} from "./kafka/ConsumerMessage";
import HLJSStatic = hljs.HLJSStatic;
import {AnkiConsole} from "../core/util/anki-console";

let vehicles: Array<Vehicle>;

console.log("scanning vehicles...");

let scanner = new VehicleScanner();
let ankiConsole = new AnkiConsole();

let kafka = new KafkaController('localhost:2181');

let isProducerStarted = false;

kafka.addListener((message: any) => {
    console.log(JSON.parse(message.value));

}, ConsumerMessage);

kafka.initializeConsumer([{ topic: 'test', partition: 0 }], 6);

kafka.initializeProducer().then((isStarted: boolean)=> {
    isProducerStarted = isStarted;
    //isStarted ? kafka.sendPayload([ { topic: 'test', messages: "finally working again" , partitions: 1 }]): console.log('not started');
});


scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
        vehicle.addListener((message) => {
            //console.log(message);
            isProducerStarted ? kafka.sendPayload([ { topic: 'test', messages: message , partitions: 1 }]): console.log('not started');
        }, PositionUpdateMessage);
    });
    ankiConsole.initializePrompt(vehicles);
});



/*var propertiesFileName = 'config.properties';
var properties = require ("properties");

properties.parse(__dirname + '/../../' + propertiesFileName, {path: true}, function(error: any, obj: any) {
    if (error) return console.error (error);
    console.log (obj);
});*/









