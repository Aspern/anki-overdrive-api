import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";

let scanner = new VehicleScanner(),
    vehicleId: string = process.argv[2],
    startPiece = 34,
    offset = -60.0;

if (!vehicleId)
    throw new Error("Please send vehicle-id as 1st parameter.");

function onError(e: Error) {
    console.error(e);
    process.exit(1);
}

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
        setTimeout(() => vehicle.changeLane(offset), 1000);
        setTimeout(() => vehicle.changeLane(offset), 2000);
    });
};

function scanTrack(vehicle) {
    var lastPiece,
        locations = [];

    vehicle.addListener((msg: PositionUpdateMessage) => {

        if (lastPiece && msg.piece === startPiece) {
            vehicle.setSpeed(0, 1500);
            setTimeout(() => process.exit(0), 1000);

        }

        if (!lastPiece)
            lastPiece = msg.piece;

        if (msg.piece !== lastPiece) {
            console.log("piece: " + lastPiece + " => locations: " + locations + ", offset: " + msg.offset + "mm");
            lastPiece = msg.piece;
            locations = [];
        }

        locations.push(msg.location);

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
        .catch(onError);
};

scanner.findById(vehicleId)
    .then(connect)
    .catch(onError);



