import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
let scanner = new VehicleScanner();

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
            [41, 42, 43],
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


let track: Track = new Track([
    new BeforeStart(),
    new AfterStart(),
    new Curve(18),
    new Curve(23),
    new Straight(39),
    new Curve(17),
    new Curve(20)
]);


let offsets: Array<number> = [],
    minOffset = -68.0,
    maxOffset = 68.0,
    width = Math.abs(minOffset) + maxOffset,
    lanes = 16,
    laneWidth = width / lanes;



for (var i = 0, offset = minOffset; i < lanes; ++i, offset += laneWidth)
    offsets.push(offset);


console.log("Test with:");
console.log("\tlanes=" + lanes);
console.log("\tminOffset=" + minOffset);
console.log("\tmaxOffset=" + maxOffset);
console.log("\twidth=" + width);
console.log("\tlaneWidth=" + laneWidth);
console.log("\toffsets=" + offsets);

scanner.findAll().then((vehicles) => {
    let vehicle = vehicles[0];

    vehicle.connect().then((vehicle) => {


        let update = false,
            valid = false;
        let lane = 0,
            lastLane = lane;

        vehicle.addListener((message: PositionUpdateMessage) => {

            if (update) {
                track.getPiece(message.piece).eachLocation(lastLane, (location: number) => {
                    if (location === message.location)
                        valid = true;
                });

                if (valid)
                    console.log("Valid lane.");
                else
                    console.error("Found invalid lane => lane=" + lastLane + ", piece=" + message.piece + ", location=" + message.location);

                valid = false;
            }

            update = false;
        }, PositionUpdateMessage);
        vehicle.setSpeed(500, 250);


        setTimeout(() => {
            var interval = setInterval(() => {

                if (lane === 16) {
                    clearInterval(interval);
                    vehicle.disconnect().then(() => {
                       process.exit(0);
                    });
                    return;
                }

                lastLane = lane;
                vehicle.changeLane(offsets[lane++]);

                setTimeout(() => {
                    update = true;
                }, 2000)

            }, 5000);
        }, 5000);


    }).catch(console.error);
}).catch(console.error);