///<reference path="../../node_modules/@types/highlight.js/index.d.ts"/>
import {VehicleScannerImpl} from "../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-impl";
import {Vehicle} from "../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {KafkaController} from "./kafka/kafka-controller";
import {ConsumerMessage} from "./kafka/ConsumerMessage";
import HLJSStatic = hljs.HLJSStatic;
import {AnkiConsole} from "../core/util/anki-console";
import {PositionUpdateMessage} from "../core/message/v2c/position-update-message";

let vehicles: Array<Vehicle>;

let peice_17 = 0,peice_18 = 0,peice_20 = 0,peice_23 = 0, peice_34 = 0,peice_33 = 0,peice_39 = 0;

console.log("scanning vehicles...");

let scanner = new VehicleScannerImpl(null);
let ankiConsole = new AnkiConsole();

let x;


let kafka = new KafkaController('localhost:2181');

let canSend: boolean;


let isProducerStarted = false;

kafka.addListener((message: any) => {
    console.log(JSON.parse(message.value));

}, ConsumerMessage);

kafka.initializeConsumer([{ topic: 'test', partition: 0 }], 6);

kafka.initializeProducer().then((isStarted: boolean)=> {
    isProducerStarted = isStarted;
    isStarted ? kafka.sendPayload([ { topic: 'test', messages: "finally working again" , partitions: 1 }]): console.log('not started');
});


scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
        vehicle.addListener((message) => {

            x = JSON.parse(JSON.stringify(message));

            isProducerStarted ? kafka.sendPayload([ { topic: 'test', messages: message , partitions: 1 }]): console.log('not started');
        }, PositionUpdateMessage);
    });
    ankiConsole.initializePrompt(vehicles);
});

/*kafka.addListener((message: any) => {
    console.log(message);
}, ConsumerMessage); */

kafka.initializeConsumer([{ topic: 'test', partition: 0 }],0);


/*var propertiesFileName = 'config.properties';
var properties = require ("properties");

properties.parse(__dirname + '/../../' + propertiesFileName, {path: true}, function(error: any, obj: any) {
    if (error) return console.error (error);
    console.log (obj);
});*/









