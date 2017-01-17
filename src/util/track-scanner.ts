import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";

let scanner = new VehicleScanner(),
    vehicleId: string = process.argv[2],
    lane: number = parseInt(process.argv[3]),
    track = [{
        id: 34,
        l: [[0, 1], [2, 3], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20], [21, 22], [23, 24], [25, 26], [27, 28], [29, 30]]
    }, {
        id: 33,
        l: [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15]]
    }, {
        id: 18,
        l: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28], [29, 30, 31], [32, 33, 34], [35, 36, 37]]
    }, {
        id: 23,
        l: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28], [29, 30, 31], [32, 33, 34], [35, 36, 37]]
    }, {
        id: 39,
        l: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23], [24, 25, 26], [27, 28, 29], [30, 31, 32], [33, 34, 35], [36, 37, 38], [39, 40, 41], [41, 42, 43], [45, 46, 47]]
    }, {
        id: 17,
        l: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28], [29, 30, 31], [32, 33, 34], [35, 36, 37]]
    }, {
        id: 20,
        l: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28], [29, 30, 31], [32, 33, 34], [35, 36, 37]]
    }],
    startPiece = 34,
    startLocation = track[0].l[lane][1];

function onError(e: Error) {
    console.error(e);
    process.exit(1);
}

if (!vehicleId)
    onError(new Error("Please send vehicle-id as 1st parameter."));


if (lane < 0 || lane > 15)
    onError(new Error("Please send lane {0-15} as 2nd parameter."));


function findStart(vehicle: Vehicle): Promise<{m: PositionUpdateMessage, v: Vehicle}> {
    return new Promise<{m: PositionUpdateMessage, v: Vehicle}>((resolve) => {
        let listener = (msg: PositionUpdateMessage) => {
            if (msg.piece === startPiece && msg.location === startLocation) {
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                resolve({m: msg, v: vehicle});
            }
        };
        vehicle.addListener(listener, PositionUpdateMessage);
        vehicle.setSpeed(300, 250);
    });
};

class Distance {
    public id: string;
    public distance: number;
    public avgSpeed: number;
    public duration: number;
}


function measureDistanceForLane(data: Array<PositionUpdateMessage>): Promise<Array<PositionUpdateMessage>> {
    return new Promise<Array<PositionUpdateMessage>>((resolve) => {
        let sumSpeed: number = 0,
            distance: Distance = new Distance();

        data.forEach((entry) => sumSpeed += entry.speed);

        distance.avgSpeed = sumSpeed / data.length;
        distance.duration = (data[data.length - 1].timestamp.getTime() - data[0].timestamp.getTime()) / 1000;
        distance.id = "" + lane;
        distance.distance = distance.avgSpeed * distance.duration;

        console.log("Distance for lane " + lane + ":");
        console.log(distance);
        console.log("");

        resolve(data);
    });
}

function measureDistanceBetweenLocations(data: Array<PositionUpdateMessage>): Promise<Array<Distance>> {
    return new Promise<Array<Distance>>((resolve) => {
        var i: number = 0,
            sumSpeed: number,
            distance: Distance,
            result: Array<Distance> = [];

        for (; i < data.length - 1; ++i) {
            sumSpeed = data[i].speed + data[i + 1].speed;

            distance = new Distance();
            distance.avgSpeed = sumSpeed / 2;
            distance.duration = (data[i + 1].timestamp.getTime() - data[i].timestamp.getTime()) / 1000;
            distance.id = data[i].piece + "@" + data[i].location + " => " + data[i + 1].piece + "@" + data[i + 1].location;
            distance.distance = distance.avgSpeed * distance.duration;

            result.push(distance);
        }

        console.log("Distance between locations: ");
        console.log(result);
        console.log("");

        resolve(result);
    });
}

function aggregateDistancesBetweenLocations(data: Array<Distance>): void {
    let aggregate = new Distance();

    aggregate.id = "" + lane;
    aggregate.distance = 0;
    aggregate.avgSpeed = 0;
    aggregate.duration = 0;

    data.forEach((entry) => {
        aggregate.distance += entry.distance;
        aggregate.duration += entry.duration;
        aggregate.avgSpeed += entry.avgSpeed;
    });

    aggregate.avgSpeed = aggregate.avgSpeed / data.length;

    console.log("Aggregated distances between locations:");
    console.log(aggregate);
    console.log("");

    process.exit(0);
}

function validate(data: Array<PositionUpdateMessage>): Promise<Array<PositionUpdateMessage>> {
    return new Promise<Array<PositionUpdateMessage>>((resolve, reject) => {
        var i = 0;

        for (var k = 0; i < track.length; ++k) {
            let piece = track[k],
                j = 0;

            if (i === 0) {
                if (data[data.length - 1].piece !== piece.id)
                    reject(new Error("Last piece should be start piece!"));

                if (data[data.length - 2].piece !== piece.id && data[data.length - 2].location !== 0)
                    reject(new Error("Last but not least piece should be start piece!"));

                j = 1;

            } else if (data[i].piece !== piece.id)
                reject(new Error("Piece does not match track [" + piece.id + " !== " + data[i].piece + "]."));


            for (; j < piece.l[lane].length; ++j) {
                if (data[i].location !== piece.l[lane][j])
                    reject(new Error("Location does not match track @" + piece.id + " [" + piece.l[lane][j] + " !== " + data[i].location + "]."));
                ++i;
            }
        }

        resolve(data);
    });
}

function scanTrack(params: {m: PositionUpdateMessage, v: Vehicle}) {
    var firstMessage: PositionUpdateMessage = params.m,
        data: Array<PositionUpdateMessage> = [firstMessage],
        vehicle: Vehicle = params.v;

    vehicle.addListener((msg: PositionUpdateMessage) => {

        if (firstMessage && msg.piece === firstMessage.piece && msg.location === firstMessage.location) {
            vehicle.setSpeed(0, 1500);
            data.push(msg);
            setTimeout(() => {
                vehicle.disconnect().catch(console.error);
            }, 500);
            validate(data)
                .then(measureDistanceForLane)
                .then(measureDistanceBetweenLocations)
                .then(aggregateDistancesBetweenLocations)
                .catch((e) => {
                    console.error(e);
                    console.error(data);
                    process.exit(1);
                });
        } else {
            data.push(msg);
        }

    }, PositionUpdateMessage);

    vehicle.setSpeed(300, 250);
}

function measure(vehicle: Vehicle): void {
    findStart(vehicle).then(scanTrack);
};

function connect(vehicle: Vehicle): void {
    vehicle.connect()
        .then(measure)
        .catch(onError);
};

scanner.findById(vehicleId)
    .then(connect)
    .catch(onError);



