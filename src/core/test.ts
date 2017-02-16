import {VehicleScanner} from "./vehicle/vehicle-scanner";
import {AnkiConsole} from "../controller/console";
import {AnkiOverdriveTrack} from "./track/anki-overdrive-track";
import {CurvePiece} from "./track/curve-piece";
import {StraightPiece} from "./track/straight-piece";
import {PositionUpdateMessage} from "./message/position-update-message";
import {DistanceFilter} from "./enrich/distance-filter";
import {LightConfig} from "./vehicle/light-config";
import {Vehicle} from "./vehicle/vehicle-interface";

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
    store: {[id: string]: {vehicle: Vehicle, desiredSpeed: number}} = {};

function antiCollision(msg: PositionUpdateMessage) {
    let obj = store[msg.vehicleId],
        vehicle = obj.vehicle,
        onCollision: boolean = false,
        distances: Array<{vehicle: string, distance: number}> = msg.distances;

    distances.forEach(distance => {

        console.log(distance);

        if (distance.distance < 500) {
            onCollision = true;

            vehicle.setLights([
                new LightConfig()
                    .red()
                    .steady(),
                new LightConfig()
                    .blue()
                    .steady(0),
                new LightConfig()
                    .green()
                    .steady(0),
            ]);

            vehicle.setSpeed(msg.speed - 100);
        } else {
            onCollision = false;
        }
    });

    if (!onCollision && msg.speed < obj.desiredSpeed) {
        vehicle.setLights([
            new LightConfig()
                .green()
                .steady(),
            new LightConfig()
                .red()
                .steady(0),
            new LightConfig()
                .blue()
                .steady(0)
        ]);
        vehicle.setSpeed(msg.speed + 100);
    } else if (!onCollision && msg.speed >= obj.desiredSpeed) {
        vehicle.setLights([
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .red()
                .steady(0),
            new LightConfig()
                .blue()
                .steady()
        ]);
    }
};

scanner.findAll().then(vehicles => {

    vehicles.forEach(vehicle => {
        store[vehicle.id] = {vehicle: vehicle, desiredSpeed: -1};
        filter.addVehicle(vehicle)
    });

    filter.onUpdate((msg: PositionUpdateMessage) => {
        antiCollision(msg);
    });


    // vehicles[0].connect().then(vehicle => {
    //     vehicle.setSpeed(400, 250);
    //     setTimeout(() => vehicle.changeLane(-68.0), 2000);
    // });
    //
    // vehicles[1].connect().then(vehicle => {
    //     vehicle.setSpeed(400, 250);
    //     setTimeout(() => vehicle.changeLane(-68.0), 2000);
    // });

    ankiConsole.onCommand((cmd, params, vehicle) => {
        console.log(cmd + " " + params + " " + vehicle)
        if (cmd === 's')
            store[vehicle].desiredSpeed = parseInt(params[0]);
    }).initializePrompt(vehicles);


}).catch(e => process.exit(1));