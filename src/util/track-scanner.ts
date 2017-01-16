import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";

let scanner = new VehicleScanner(),
    vehicleId: string = process.argv[2],
    startPiece = 34;

if (!vehicleId)
    throw new Error("Please send vehicle-id as 1st parameter.");

function findStart(vehicle: Vehicle): Promise<Vehicle> {
    return new Promise<Vehicle>((resolve) => {
        let listener = (msg: PositionUpdateMessage) => {
            if (msg.piece === startPiece) {
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                resolve(vehicle);
            }
        };
        vehicle.addListener(listener, PositionUpdateMessage);
        vehicle.setSpeed(300, 250);
    });
};

function scanTrack(vehicle) {
    var lastPiece;

    vehicle.addListener((msg: PositionUpdateMessage) => {

        if (lastPiece && msg.piece === startPiece)
            vehicle.setSpeed(0, 1500);

        if (!lastPiece)
            lastPiece = msg.piece;

        if (msg.piece !== lastPiece) {
            console.log(lastPiece + ", ");
            lastPiece = msg.piece;
        }

    }, PositionUpdateMessage);

    setTimeout(() => {
        vehicle.setSpeed(300, 250);
    }, 2000);

}

function measure(vehicle: Vehicle): void {
    findStart(vehicle).then(scanTrack);
};

function connect(vehicle: Vehicle): void {
    vehicle.connect()
        .then(measure)
        .catch((e) => {
            throw e;
        });
};

scanner.findById(vehicleId)
    .then(connect)
    .catch((e) => {
        throw e;
    });



