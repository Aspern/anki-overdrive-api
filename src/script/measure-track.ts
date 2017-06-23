import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import * as uuid from "node-uuid";
import {JsonSettings} from "../core/settings/json-settings";
import {ResultHandler} from "../core/util/result-handler-interface";
import {Result} from "../core/util/result";
import {TrackRunner} from "../core/util/track-runner";
import {PositionUpdateMessage} from "../core/message/v2c/position-update-message";
import {MongoResultHandler} from "../core/util/mongo-result-handler";

/************************************************************************************
 *                                  MEASURE TRACK                                   *
 *                                                                                  *
 *  Uses any vehicle to measure the track in mm and handles the result using an     *
 *  implementation on a result-handler interface. Before starting the script,         *
 *  please check the 'settings.json' if the track is specified correctly and        *
 *  choose an implementation of the result-handler (default is output to console).  *
 *                                                                                  *
 *  Important: Before starting choose any vehicle, turn it on (and only this        *
 *             vehicle!) and put it in the middle of the start lanes (offset=0).    *
 *                                                                                  *
 ************************************************************************************/


let settings = new JsonSettings(),
    track = settings.getAsTrack("setup.track.pieces"),
    setup = settings.getAsSetup("setup"),
    scanner = new VehicleScanner(setup),
    vehicleId: string,
    uniqueId: string = uuid.v4(),
    resultHandler: ResultHandler = new MongoResultHandler();

/**
 * Uses the messages between two consecutive locations to calculate the distance between them.
 *
 * @param m1 Message from location l
 * @param m2 Message from location l+1
 * @param lane Current lane
 * @return {Distance} Distance between locations
 */
function measureDistanceBetween(m1: PositionUpdateMessage, m2: PositionUpdateMessage, lane: number): Result {
    let t1 = m1.timestamp.getTime(),
        t2 = m2.timestamp.getTime(),
        s1 = m1.speed,
        s2 = m2.speed,
        duration = (t2 - t1) / 1000,
        avgSpeed = (s1 + s2) / 2,
        transition = m1.piece + "@" + m1.location + " => " + m2.piece + "@" + m2.location;

    if (duration <= 0)
        console.error("Invalid duration: " + duration);

    return new Result(uniqueId, vehicleId, lane, avgSpeed, duration, transition);

}

/**
 * Calculates all distances between the locations on the current lane.
 *
 * @param messages Messages for this lane
 * @param lane Current lane
 * @return {Array<Distance>} Distances between all locations on this lane
 */
function measureDistanceBetweenLocations(messages: Array<PositionUpdateMessage>, lane: number): Array<Result> {
    let distances: Array<Result> = [];

    for (let i = 0; i < messages.length - 1; ++i) {
        let m1 = messages[i],
            m2 = messages[i + 1],
            distance = measureDistanceBetween(m1, m2, lane);

        distances.push(distance);
    }

    return distances;
}

/**
 * Measures the length of the whole lane using the first and last message of the lane data.
 *
 * @param messages Messages for current lane
 * @param lane Current Lane
 * @return {Distance} Distance for whole lane
 */
function measureLaneLength(messages: Array<PositionUpdateMessage>, lane: number): Result {
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
    distance.avgSpeed = avgSpeed;

    console.log("Distance for lane " + lane + ": " + distance.distance + " mm.");

    return distance;
}

/**
 * Uses all messages for each lane and location and calculates the distances between the
 * single location and the length of each lane.
 *
 * @param messages Messages for all lanes
 */
function measureTrack(messages: Array<Array<PositionUpdateMessage>>): void {
    let result: Array<[Result, Array<Result>]> = []

    for (let lane = 0; lane < messages.length; ++lane) {
        result.push([
            measureLaneLength(messages[lane], lane),
            measureDistanceBetweenLocations(messages[lane], lane)
        ]);
    }

    resultHandler.handle(result);
}

// Program starts here.
scanner.findAny().then(vehicle => {

    let runner = new TrackRunner(vehicle, track);
    vehicleId = vehicle.id;

    console.log("Start scanning track...");
    runner.onTrackFinished((messages: Array<Array<PositionUpdateMessage>>) => {
        console.log("Measuring lanes and transitions...");
        measureTrack(messages);
        console.log("Finished measuring track.");
    }).run();

}).catch((e) => {
    console.error(e);
    process.exit(0);
});


