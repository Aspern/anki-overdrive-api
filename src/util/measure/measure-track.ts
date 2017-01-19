import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import reject = Promise.reject;
import {PositionUpdateMessage} from "../../core/message/position-update-message";

abstract class Piece {
    private _lanes: Array<Array<number>> = [[]];
    private _id: number;


    protected constructor(lanes: Array<Array<number>>, id: number) {
        this._lanes = lanes;
        this._id = id;
    }

    eachLocation(lane: number, handler: (location: number) => any): void {
        this._lanes[lane].forEach(handler);
    }

    getLocation(lane: number, position: number) {
        if (lane >= this._lanes.length)
            throw new Error("Found no lane [" + lane + "] in this piece [" + this._id + "].");

        if (position >= this._lanes[lane].length)
            throw new Error("Found no position [" + position + "] on lane [" + lane + "] in" +
                " piece [" + this._id + "].");

        return this._lanes[lane][position];
    }

    get id(): number {
        return this._id;
    }
}

class BeforeStart extends Piece {

    static _ID: number = 34;

    constructor() {
        super([
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [8, 9],
            [10, 11],
            [12, 13],
            [14, 15],
            [16, 17],
            [18, 19],
            [20, 21],
            [22, 23],
            [24, 25],
            [26, 27],
            [28, 29],
            [30, 31]
        ], BeforeStart._ID);
    }
}

class AfterStart extends Piece {

    static _ID: number = 33;

    constructor() {
        super([
            [0],
            [1],
            [2],
            [3],
            [4],
            [5],
            [6],
            [7],
            [8],
            [9],
            [10],
            [11],
            [12],
            [13],
            [14],
            [15]
        ], AfterStart._ID);
    }

}

class Straight extends Piece {

    constructor(id: number) {
        super([
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10, 11],
            [12, 13, 14],
            [15, 16, 17],
            [18, 19, 20],
            [21, 22, 23],
            [24, 25, 26],
            [27, 28, 29],
            [30, 31, 32],
            [33, 34, 35],
            [36, 37, 38],
            [39, 40, 41],
            [42, 43, 44],
            [45, 46, 47]
        ], id);
    }

}

class Curve extends Piece {

    constructor(id: number) {
        super([
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [8, 9],
            [10, 11],
            [12, 13],
            [14, 15],
            [16, 17],
            [18, 19],
            [20, 21, 22],
            [23, 24, 25],
            [26, 27, 28],
            [29, 30, 31],
            [32, 33, 34],
            [35, 36, 37]
        ], id);
    }
}

class Track {

    private _pieces: Array<Piece> = [];

    constructor(pieces: Array<Piece>) {
        this._pieces = pieces;
    }

    eachPiece(handler: (piece: Piece) => any): void {
        this._pieces.forEach(handler);
    }

    getPiece(id: number): Piece {
        for (var i = 0; i < this._pieces.length; ++i)
            if (this._pieces[i].id === id)
                return this._pieces[i];

        throw new Error("Found no piece with id [" + id + "] in this track.");
    }

    getBeforeStart(): Piece {
        return this.getPiece(BeforeStart._ID);
    }
}


let scanner = new VehicleScanner(),
    debugging: boolean = process.argv[2] === "true" || true,
    speed = 400,
    acceleration = 250,
    track: Track = new Track([
        new BeforeStart(),
        new AfterStart(),
        new Curve(18),
        new Curve(23),
        new Straight(39),
        new Curve(17),
        new Curve(20)
    ]);


function handleError(e: Error): void {
    console.error(e);
    process.exit(1);
}

function finish(): void {
    if (debugging)
        console.log("Finished measuring track.");

    process.exit(0);
}

function printResult(results: Array<Array<PositionUpdateMessage>>): Promise<void> {
    return new Promise<void>((resolve) => {
        let i = 0;
        results.forEach((lane) => {
            console.log("Results for lane " + ++i);
            for(var j = 0; j < lane.length - 1; ++j) {
                let m1 = lane[j],
                    m2 = lane[j + 1],
                    out = "";

                out += m1.piece + "@" +m1.location;
                out += " => " + m2.piece + "@" + m2.location + "\t";
                out += "distance = " + ((m1.speed + m2.speed)/2) * ((m2.timestamp.getTime() - m1.timestamp.getTime()) / 1000) + "mm";
                console.log(out);
            }
            console.log("");
        });
        resolve();
    });
}


function findLane([vehicle, lane, offset] : [Vehicle, number, number]): Promise<[Vehicle, PositionUpdateMessage, number]> {
    if (debugging)
        console.log("Searching for lane [" + lane + "]...");

    return new Promise<[Vehicle, PositionUpdateMessage, number]>((resolve, reject) => {

        let attempts: number = 0,
            listener = (message: PositionUpdateMessage) => {
                try {
                    let piece = message.piece,
                        location = message.location,
                        firstLocation = track.getBeforeStart().getLocation(lane, 1);

                    if (attempts >= 3)
                        reject(new Error("Unable to find start, please try again with other" +
                            " parameters."));

                    if (piece === BeforeStart._ID) {
                        if (location === firstLocation) {
                            vehicle.removeListener(listener);

                            if (debugging)
                                console.log("Found lane [" + lane + "].");

                            attempts = 0;
                            resolve([vehicle, message, lane]);
                        } else if (location < firstLocation - 1 || location > firstLocation + 1) {
                            vehicle.changeLane(offset);
                            ++attempts;
                        }

                    }
                } catch (e) {
                    reject(e);
                }
            };

        vehicle.changeLane(offset);
        setTimeout(() => vehicle.addListener(listener, PositionUpdateMessage), 1000);
    });
}

class ValidationReport {

    private _valid: boolean;
    private _piece: {found: number, expected: number};
    private _location: {found: number, expected: number};
    private _e: Error;

    setError(e: Error): ValidationReport {
        this._e = e;
        return this;
    }

    setValid(): ValidationReport {
        this._valid = true;
        return this;
    }

    setInvalid(): ValidationReport {
        this._valid = false;
        return this;
    }

    setPiece(found: number, expected: number): ValidationReport {
        this._piece = {
            found: found,
            expected: expected
        };
        return this;
    }

    setLocation(found: number, expected: number): ValidationReport {
        this._location = {
            found: found,
            expected: expected
        };
        return this;
    }

    get valid(): boolean {
        return this._valid;
    }

    get piece(): {found: number; expected: number} {
        return this._piece;
    }

    get location(): {found: number; expected: number} {
        return this._location;
    }


    get e(): Error {
        return this._e;
    }
}

function validateMessages(messages: Array<PositionUpdateMessage>, lane: number): ValidationReport {
    if (debugging)
        console.log("Validating reports for lane [" + lane + "]...");

    let report = new ValidationReport().setValid(),
        i = 0;

    try {

        track.eachPiece((piece) => {
            let p = messages[i] ? messages[i].piece : undefined;

            if (piece.id !== p)
                report.setInvalid().setPiece(p, piece.id);


            if (i === 0) {
                let l = messages[i] ? messages[i].location : undefined;

                if (piece.getLocation(lane, 1) !== l)
                    report.setInvalid().setLocation(l, piece.getLocation(lane, 1));

                ++i;
            } else {
                piece.eachLocation(lane, (location) => {
                    let l = messages[i] ? messages[i].location : undefined;

                    if (location !== l)
                        report.setInvalid().setLocation(l, location);

                    ++i;
                });
            }
        });

        let nextToLastMessage = messages[i] ? messages[i] : undefined;
        ++i;
        let lastMessage = messages[i] ? messages[i] : undefined;

        if (!lastMessage || !nextToLastMessage)
            report.setInvalid();
        else if (lastMessage.piece !== BeforeStart._ID || nextToLastMessage.piece !== BeforeStart._ID)
            report.setInvalid().setPiece(lastMessage.piece, BeforeStart._ID);
        else if (nextToLastMessage.location !== track.getBeforeStart().getLocation(lane, 0))
            report.setInvalid().setLocation(nextToLastMessage.location, track.getBeforeStart().getLocation(lane, 0));
        else if (lastMessage.location !== track.getBeforeStart().getLocation(lane, 1))
            report.setInvalid().setLocation(lastMessage.location, track.getBeforeStart().getLocation(lane, 1));

    } catch (e) {
        report.setInvalid().setError(e);
    }

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
        console.log("Starting measuring track with data [" + data + "].");

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

            resolve(vehicles[0]);
        }
    });
}


scanner.findAll()
    .then(pickAnyVehicle)
    .then(prepareMeasurement)
    .then(measureTrack)
    .then(printResult)
    .then(finish)
    .catch(handleError);

