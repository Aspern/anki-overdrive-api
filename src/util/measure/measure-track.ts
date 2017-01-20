import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import reject = Promise.reject;
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {ConsoleResultHandler} from "./console-result-handler";
import {ValidationReport} from "./validation-report";
import {Track} from "../../core/track/track-interface";
import {AnkiOverdriveTrack} from "../../core/track/anki-overdrive-track";
import {CurvePiece} from "../../core/track/curve-piece";
import {StraightPiece} from "../../core/track/straight-piece";
import {StartPiece} from "../../core/track/start-piece";
import {Distance} from "./distance";


let scanner = new VehicleScanner(),
    debugging: boolean = process.argv[2] === "true" || true,
    speed = 400,
    acceleration = 250,
    vehicleId: string,
    track: Track = AnkiOverdriveTrack.build([
        new CurvePiece(18),
        new CurvePiece(23),
        new StraightPiece(39),
        new CurvePiece(17),
        new CurvePiece(20)
    ]),
    resultHandler = new ConsoleResultHandler();


function handleError(e: Error): void {
    console.error(e);
    process.exit(0);
}

function finish(): void {
    if (debugging)
        console.log("Finished measuring track.");

    process.exit(0);
}


function handleResult(results: Array<[Distance, Array<Distance>]>): Promise<void> {
    return new Promise<void>((resolve) => {
        resultHandler.handleResult(results);
        resolve();
    });
}


function calculateDistanceForLane(messages: Array<PositionUpdateMessage>, lane: number): Distance {
    let avgSpeed: number = 0,
        firstMessage = messages[0],
        lastMessage = messages[messages.length - 1],
        duration = (lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / 1000;

    messages.forEach((message) => {
        avgSpeed += message.speed;
    });

    avgSpeed /= messages.length;

    return new Distance(vehicleId, lane, avgSpeed, duration);
}

function calculateDistancesForTransitions(messages: Array<PositionUpdateMessage>, lane: number): Array<Distance> {
    let distances = [];

    for (var i = 0; i < messages.length - 1; ++i) {
        let message1 = messages[i],
            message2 = messages[i + 1],
            avgSpeed = (message1.speed + message2.speed) / 2,
            duration = (message2.timestamp.getTime() - message1.timestamp.getTime()) / 1000,
            transition: [[number, number], [number, number]] = [[message1.id, message1.location], [message2.id, message2.location]];

        distances.push(new Distance(vehicleId, lane, avgSpeed, duration, transition));
    }

    return distances;
}

function calculateDistances(results: Array<Array<PositionUpdateMessage>>): Promise<Array<[Distance, Array<Distance>]>> {
    console.log(results);

    return new Promise < Array<[Distance, Array<Distance>]>>((resolve) => {
        let distances: Array<[Distance, Array<Distance>]> = [];

        for (var i = 0; i < results.length; ++i) {
            let result = results[i];
            distances.push([calculateDistanceForLane(result, i), calculateDistancesForTransitions(result, i)]);
        }

        resolve(distances);
    });
}


function findLane([vehicle, lane, offset] : [Vehicle, number, number]): Promise<[Vehicle, PositionUpdateMessage, number]> {
    if (debugging)
        console.log("Searching for lane [" + lane + "]...");

    return new Promise<[Vehicle, PositionUpdateMessage, number]>((resolve, reject) => {
        let attempts: number = 0,
            listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location,
                    startLocation = track.start.getLocation(lane, 0);

                if (attempts >= 3)
                    reject(new Error("Unable to find start, please try."));

                if (piece === StartPiece._ID) {
                    if (location === startLocation) {
                        vehicle.removeListener(listener);

                        if (debugging)
                            console.log("Found lane [" + lane + "].");

                        attempts = 0;
                        resolve([vehicle, message, lane]);
                    } else if (location < startLocation || location > startLocation) {
                        vehicle.changeLane(offset);
                        ++attempts;
                    }
                }

            };

        vehicle.changeLane(offset);
        setTimeout(() => vehicle.addListener(listener, PositionUpdateMessage), 1000);
    });
}


function validateMessages(messages: Array<PositionUpdateMessage>, lane: number): ValidationReport {
    if (debugging)
        console.log("Validating reports for lane [" + lane + "]...");

    let report = new ValidationReport().setValid(),
        i = 0;

    track.eachPiece((piece) => {
        let foundPiece = messages[i] ? messages[i].piece : undefined,
            expectedPiece = piece.id;

        if (foundPiece !== expectedPiece)
            report.setInvalid()
                .setPiece(foundPiece, expectedPiece);

        piece.eachLocationOnLane(lane, (location) => {
            let foundLocation = messages[i] ? messages[i].location : undefined,
                expectedLocation = location;

            if (foundLocation !== expectedLocation)
                report.setInvalid()
                    .setPiece(foundPiece, expectedPiece)
                    .setLocation(foundLocation, expectedLocation);
            ++i;
        });

    });

    return report;
}


function collectMessages([vehicle, startMessage, lane]:[Vehicle, PositionUpdateMessage, number]): Promise<Array<PositionUpdateMessage>> {
    if (debugging)
        console.log("Collecting messages for lane [" + lane + "]...");

    return new Promise<Array<PositionUpdateMessage>>((resolve) => {
        let messages: Array<PositionUpdateMessage> = [startMessage],
            listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location;

                if (messages.length > 1 && piece === startMessage.piece && location === startMessage.location) {
                    messages.push(message);
                    let report = validateMessages(messages, lane);
                    if (report.valid) {
                        vehicle.removeListener(listener);

                        if (debugging)
                            console.log("Collected messages for lane [" + lane + "].");

                        resolve(messages);
                    } else {
                        console.error(report);
                        messages = [startMessage];
                    }
                } else
                    messages.push(message);
            };

        vehicle.addListener(listener, PositionUpdateMessage);
    });
}

function measureLane([vehicle, [lane, offset]]:[Vehicle, [number, number]]): Promise<Array<PositionUpdateMessage>> {
    if (debugging)
        console.log("Starting measuring lane [" + lane + "]...");

    return new Promise<Array<PositionUpdateMessage>>((resolve, reject) => {
        findLane([vehicle, lane, offset])
            .then(collectMessages)
            .then(resolve)
            .catch(reject);
    });
}

function measureTrack([vehicle, data] : [Vehicle, Array<[number, number]>]): Promise<Array<Array<PositionUpdateMessage>>> {
    if (debugging)
        console.log("Starting measuring track with [lane,offset] [" + data + "].");

    return data.reduce((promise, d) => {
        return promise.then((results: Array<Array<PositionUpdateMessage>>) => {

            return measureLane([vehicle, d]).then((result: Array<PositionUpdateMessage>) => {
                results.push(result);
                return results;
            });

        });
    }, Promise.resolve([]));
}

function prepareMeasurement(vehicle: Vehicle): Promise<[Vehicle, Array<[number, number]>]> {
    if (debugging)
        console.log("Preparing measurement...");

    return new Promise<[Vehicle, Array<[number, number]>]>((resolve, reject) => {
        vehicle.connect().then(() => {
            let data: Array<[number, number]> = [],
                minOffset = -68.0,
                maxOffset = 68.0,
                width = Math.abs(minOffset) + maxOffset,
                lanes = 16,
                laneWidth = width / lanes;

            for (var i = 0, offset = minOffset; i < 16; ++i, offset += laneWidth)
                data.push([i, offset]);

            vehicle.setSpeed(speed, acceleration);
            resolve([vehicle, data]);
        }).catch(reject);
    });
}

function pickAnyVehicle(vehicles: Array<Vehicle>): Promise<Vehicle> {
    return new Promise<Vehicle>((resolve, reject) => {
        if (vehicles.length === 0)
            reject(new Error("Found no vehicle."));
        else {
            let vehicle = vehicles[0];

            if (debugging)
                console.log("Found vehicle [" + vehicle.id + "].");

            vehicleId = vehicle.id;
            resolve(vehicles[0]);
        }
    });
}

scanner.findAll()
    .then(pickAnyVehicle)
    .then(prepareMeasurement)
    .then(measureTrack)
    .then(calculateDistances)
    .then(handleResult)
    .then(finish)
    .catch(handleError);

