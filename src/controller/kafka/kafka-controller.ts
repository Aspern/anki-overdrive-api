import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {AnkiConsole} from "../console";
import {KafkaController} from "./kafkacontroller";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {AnkiOverdriveTrack} from "../../core/track/anki-overdrive-track";
import {CurvePiece} from "../../core/track/curve-piece";
import {StraightPiece} from "../../core/track/straight-piece";
import {DistanceFilter} from "../../core/enrich/distance-filter";
import {TransitionUpdateMessage} from "../../core/message/transition-update-message";
import {DrivingDirection} from "../../core/message/driving-direction";

let scanner = new VehicleScanner(),
    ankiConsole = new AnkiConsole(),
    track = AnkiOverdriveTrack.build([
        new CurvePiece(18),
        new CurvePiece(23),
        new StraightPiece(39),
        new CurvePiece(17),
        new CurvePiece(20)
    ]),
    filter = new DistanceFilter(track),
    kafka = new KafkaController('localhost:2181'),
    minSpeed = 100,
    maxSpeed = 1100,
    minOffset = 0,
    maxOffset = 68.0,
    minAccel = 100,
    maxAccel = 900;

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

        vehicles.forEach(vehicle => {
            filter.addVehicle(vehicle);
        });

        filter.onUpdate((msg: PositionUpdateMessage) => {
            kafka.sendPayload([
                {
                    topic: 'cardata',
                    partitions: 1,
                    messages: JSON.stringify(msg).replace(/_/g, "")
                }
            ]);
        });


        //ankiConsole.initializePrompt(vehicles);

        let vehicle = vehicles[0];

        vehicle.addListener((msg:TransitionUpdateMessage) => {
            if(msg.direction === DrivingDirection.REVERSE)
                vehicle.uTurn();
        }, TransitionUpdateMessage);

        vehicle.connect().then(() => {
            vehicle.setOffset(68.0);
            setInterval(() => {
                let rndSpeed = randomInt(minSpeed, maxSpeed),
                    rndAccel = randomInt(minAccel, maxAccel);

                vehicle.setSpeed(rndSpeed, rndAccel);
                console.log("Change speed to:\t" + rndSpeed + "mm/sec (" + rndAccel + "mm/sec²).");
            }, 5000);
            setTimeout(() => {
                setInterval(() => {
                    let rndOffset = random(minOffset, maxOffset),
                        coefficient = randomInt(0, 2) === 1 ? -1 : 1;

                    rndOffset *= coefficient;

                    vehicle.changeLane(rndOffset);
                    console.log("Change offset to:\t" + rndOffset + "mm.");
                }, 7000);
            }, 7000);
        });

    }).catch(e => {
        console.error(e);
        process.exit(0);
    });

})

