import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {JsonSettings} from "../core/settings/json-settings";
import {SimpleDistanceFilter} from "../core/filter/simple-distance-filter";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";
import {AnkiConsole} from "../core/util/anki-console";
import {Distance} from "../core/filter/distance";
import {isNullOrUndefined} from "util";
import {LightConfig} from "../core/vehicle/light-config";
import {KafkaController} from "../controller/kafka/kafka-controller";
import {VehicleMessage} from "../core/message/vehicle-message";
import websocket = require('websocket');
import http = require('http');


let scanner = new VehicleScanner(),
    settings = new JsonSettings(),
    ankiConsole = new AnkiConsole(),
    track = settings.getAsTrack("track"),
    filter = new SimpleDistanceFilter(),
    store: {[key: string]: {speed: number, vehicle: Vehicle}} = {},
    kafkaController = new KafkaController(),
    antiCollisionOn = false,
    WebSocketClient = require('websocket').client,
    client = new WebSocketClient(),
    node_server = 'ws://localhost:8080/';

var connection_new;






function handleError(e: Error) {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}

function driveNormal(message: PositionUpdateMessage): void {
    let record = store[message.vehicleId];

    if (message.speed < record.speed - 30)
        speedUp(message);
    else
        holdSpeed(message);
}

function brake(message: PositionUpdateMessage) {
    let record = store[message.vehicleId];

    record.vehicle.setSpeed(message.speed - 50, 200);
    record.vehicle.setLights([
        new LightConfig()
            .green()
            .steady(0),
        new LightConfig()
            .red()
            .steady(),
        new LightConfig()
            .blue()
            .steady(0)
    ]);
}

function holdSpeed(message: PositionUpdateMessage): void {
    let record = store[message.vehicleId];

    record.vehicle.setLights([
        new LightConfig()
            .green()
            .steady(0),
        new LightConfig()
            .red()
            .steady(0),
        new LightConfig()
            .blue()
            .steady()
    ]);
}

function speedUp(message: PositionUpdateMessage) {
    let record = store[message.vehicleId];

    record.vehicle.setSpeed(record.speed, 50);
    record.vehicle.setLights([
        new LightConfig()
            .green()
            .steady(),
        new LightConfig()
            .red()
            .steady(0),
        new LightConfig()
            .blue()
            .steady(0)
    ]);
}

function handleAntiCollision(message: PositionUpdateMessage, distance: Distance): boolean {
    if (distance.horizontal <= 500)
        brake(message);
    else if (distance.horizontal > 700)
        driveNormal(message);
    else
        holdSpeed(message);


    return true;
}

function supervise(message: VehicleMessage): void {
    if (antiCollisionOn && message instanceof PositionUpdateMessage) {
        let distances = message.distances,
            onCollision = false;

        distances.forEach(distance => {
            if (!isNullOrUndefined(distance.delta)
                && distance.delta < 0
                && distance.vertical <= 34)
                onCollision = handleAntiCollision(message, distance);
        });

        if (!onCollision)
            driveNormal(message);
    }

    kafkaController.sendPayload([{
        topic: "cardata-filtered",
        partitions: 1,
        messages: JSON.stringify(message).replace(/_/g, "")
    }]);
}

client.on('connectFailed', (error: Error) => {
    console.log('Connect Error: ' + error.toString());
});
//if connection is made to the server
client.on('connect', (connection: websocket.connection) => {
    console.log('WebSocket client connected');
    //connection_new = connection;
    connection.on('error', (error: Error) => {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', () => {
        console.log('Connection Closed');
    });

    connection.on('message', (message: websocket.IMessage) => {


        if(message.utf8Data == "A1")
        {
            console.log("Received: '" + message.utf8Data + "'");
            antiCollisionOn = true;
            connection.send('{"event":"webgui","data":"Started"}');
        }

        else if(message.utf8Data == "A0")
        {
            antiCollisionOn = false;
            console.log("Received: '" + message.utf8Data + "'");
            connection.send('{"event":"webgui","data":"Stop"}');


        }

    });




});

//connecting to the node server
client.connect(node_server, '');


console.log("Starting Kafka Controller...");
kafkaController.initializeProducer().then(online => {
    if (!online)
        handleError(new Error("Kafka Server is offline."));

    console.log("Searching for vehicles in BLE...");
    scanner.findAll().then(vehicles => {

        vehicles.forEach(vehicle => {
            store[vehicle.id] = {
                speed: 0,
                vehicle: vehicle
            };
        });

        console.log("Found " + vehicles.length + " vehicles.");


        filter.init([track, vehicles]);
        filter.onUpdate(supervise);
        filter.start().catch(handleError);

        ankiConsole.onCommand((cmd, params, vehicle) => {
            if (cmd === 's')
                store[vehicle].speed = parseInt(params[0]);
            else if(cmd === 'anti-collision')
                antiCollisionOn = params[0] === 'on';
        }).initializePrompt(vehicles);

    }).catch(handleError);

}).catch(handleError);
