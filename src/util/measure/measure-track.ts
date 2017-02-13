import {TrackRunner} from "../runner/track-runner";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {Track} from "../../core/track/track-interface";
import {AnkiOverdriveTrack} from "../../core/track/anki-overdrive-track";
import {CurvePiece} from "../../core/track/curve-piece";
import {StraightPiece} from "../../core/track/straight-piece";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {Distance} from "./distance";
import * as uuid from "node-uuid";
import {ConsoleResultHandler} from "./console-result-handler";
import {FileResultHandler} from "./file-result-handler";

let track: Track = AnkiOverdriveTrack.build([
        new CurvePiece(18),
        new CurvePiece(23),
        new StraightPiece(39),
        new CurvePiece(17),
        new CurvePiece(20)
    ]),
    scanner = new VehicleScanner(),
    vehicleId: string,
    uniqueId: string = uuid.v4(),
    resultHandler = new FileResultHandler();


function measureDistanceBetween(m1: PositionUpdateMessage, m2: PositionUpdateMessage, lane: number): Distance {
    let t1 = m1.timestamp.getTime(),
        t2 = m2.timestamp.getTime(),
        s1 = m1.speed,
        s2 = m2.speed,
        duration = (t2 - t1) / 1000,
        avgSpeed = (s1 + s2) / 2,
        transition = m1.piece + "@" + m1.location + " => " + m2.piece + "@" + m2.location;

    return new Distance(uniqueId, vehicleId, lane, avgSpeed, duration, transition);

}

function measureDistanceBetweenLocations(messages: Array<PositionUpdateMessage>, lane: number): Array<Distance> {
    let distances: Array<Distance> = [];

    for (let i = 0; i < messages.length - 1; ++i) {
        let m1 = messages[i],
            m2 = messages[i + 1],
            distance = measureDistanceBetween(m1, m2, lane);

        distances.push(distance);
    }

    return distances;
}

function measureLaneLength(messages: Array<PositionUpdateMessage>, lane: number): Distance {
    let start = messages[0],
        end = messages[messages.length - 1],
        distance = measureDistanceBetween(start, end, lane),
        avgSpeed: number = 0;

    // Calculate avgSpeed for all points in this case.
    messages.forEach((message) => {
        avgSpeed += message.speed;
    });

    avgSpeed /= messages.length;
    distance.distance = distance.duration * avgSpeed;
    distance.avgSpeed = avgSpeed

    return distance;
}


function measureTrack(messages: Array<Array<PositionUpdateMessage>>): void {
    let result: Array<[Distance, Array<Distance>]> = []

    for (let lane = 0; lane < messages.length; ++lane) {
        result.push([
            measureLaneLength(messages[lane], lane),
            measureDistanceBetweenLocations(messages[lane], lane)
        ]);
    }

    resultHandler.handle(result);
}


scanner.findAny().then((vehicle) => {

    let runner = new TrackRunner(vehicle, track);
    vehicleId = vehicle.id;

    console.log("Start scanning track...");
    runner.onTrackFinished((messages: Array<Array<PositionUpdateMessage>>) => {
        console.log("Measuring lanes and transitions...");
        measureTrack(messages);
        console.log("Finished measuring track.");
        process.exit(0);
    }).run();

}).catch((e) => {
    console.error(e);
    process.exit(0);
});


