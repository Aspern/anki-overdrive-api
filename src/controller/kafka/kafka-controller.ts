import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {KafkaController} from "./kafkacontroller";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {AnkiOverdriveTrack} from "../../core/track/anki-overdrive-track";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {wrap} from "node-mysql-wrapper";
/// <reference path="../../../decl/mysql.d.ts"/>
import * as mysql from "mysql";
import {isNullOrUndefined} from "util";
import {AnkiConsole} from "../../core/util/anki-console";
import {Curve} from "../../core/track/curve";
import {Straight} from "../../core/track/straight";
import {SimpleDistanceFilter} from "../../core/filter/simple-distance-filter";

let scanner = new VehicleScanner(),
    ankiConsole = new AnkiConsole(),
    track = AnkiOverdriveTrack.build([
        new Curve(18),
        new Curve(23),
        new Straight(39),
        new Curve(17),
        new Curve(20)
    ]),
    filter = new SimpleDistanceFilter(),
    kafka = new KafkaController('localhost:2181'),
    minSpeed = 550,
    maxSpeed = 1150,
    minOffset = 0,
    maxOffset = 68.0,
    store: {[key: string]: Vehicle} = {};

function randomInt(low: number, high: number) {
    return Math.floor(Math.random() * (high - low) + low);
}

function random(low: number, high: number) {
    return Math.random() * (high - low) + low;
}


kafka.initializeProducer().then(running => {
    if (!running) {
        console.warn("Kafka is not running @localhost:2181");
        process.exit(0);
    }

    scanner.findAll().then(vehicles => {

        filter.init([track, vehicles]);

        vehicles.forEach(vehicle => {

            store[vehicle.id] = vehicle;
        });

        let lastPiece: number = null;

        filter.onUpdate((msg: PositionUpdateMessage) => {

            kafka.sendPayload([
                {
                    topic: 'cardata',
                    partitions: 1,
                    messages: JSON.stringify(msg).replace(/_/g, "")
                }
            ]);


            let id = "" + msg.piece + msg.lane,
                vehicle = store[msg.vehicleId];


            db.ready(() => {

                if (!isNullOrUndefined(lastPiece) || msg.piece !== lastPiece) {
                    db.query("SELECT speed FROM BATCHVIEW WHERE id = '" + id + "'", (error, result) => {
                        if (!isNullOrUndefined(error))
                            console.error(error);

                        if (!isNullOrUndefined(result[0])) {
                            let speed: number = result[0].speed;
                            console.log(speed);
                            vehicle.setSpeed(speed, 500);
                        }

                    });
                    lastPiece = msg.piece;
                }

            });


        });


        //ankiConsole.initializePrompt(vehicles);

        let vehicle = vehicles[0],
            connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'anki'
            }),
            db = wrap(connection);

        vehicle.connect().then(() => {
            vehicle.setOffset(-68.0);
            vehicle.setSpeed(500, 500);
        });


        // let vehicle = vehicles[0];
        //
        //
        // vehicle.connect().then(() => {
        //     vehicle.setOffset(68.0);
        //     setInterval(() => {
        //         let rndSpeed = randomInt(minSpeed, maxSpeed),
        //             rndAccel = 600;
        //
        //         vehicle.setSpeed(rndSpeed, rndAccel);
        //         console.log("Change speed to:\t" + rndSpeed + "mm/sec (" + rndAccel + "mm/sec²).");
        //     }, 5000);
        //     setTimeout(() => {
        //         setInterval(() => {
        //             let rndOffset = random(minOffset, maxOffset),
        //                 coefficient = randomInt(0, 2) === 1 ? -1 : 1;
        //
        //             rndOffset *= coefficient;
        //
        //             vehicle.changeLane(rndOffset);
        //             console.log("Change offset to:\t" + rndOffset + "mm.");
        //         }, 7000);
        //     }, 7000);
        // });

    }).catch(e => {
        console.error(e);
        process.exit(0);
    });

});

