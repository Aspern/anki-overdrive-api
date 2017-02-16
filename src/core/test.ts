import {VehicleScanner} from "./vehicle/vehicle-scanner";
import {AnkiConsole} from "../controller/console";
import {AnkiOverdriveTrack} from "./track/anki-overdrive-track";
import {CurvePiece} from "./track/curve-piece";
import {StraightPiece} from "./track/straight-piece";
import {PositionUpdateMessage} from "./message/position-update-message";
import {DistanceFilter} from "./enrich/distance-filter";
import {LightConfig} from "./vehicle/light-config";
import {Vehicle} from "./vehicle/vehicle-interface";
import {JsonSettings} from "../settings/json-settings";

let scanner = new VehicleScanner(),
    ankiConsole = new AnkiConsole(),
    settings = new JsonSettings(),
    config = settings.getAsObject("vehicles"),
    track = settings.getAsTrack("track"),
    filter = new DistanceFilter(track),
    store: {[id: string]: {vehicle: Vehicle, desiredSpeed: number}} = {};


function antiCollision(msg: PositionUpdateMessage) {
    let obj = store[msg.vehicleId],
        vehicle = obj.vehicle,
        onCollision: boolean = false,
        distances: Array<{vehicle: string, distance: number}> = msg.distances;

    distances.forEach(distance => {
        if (distance.distance < 500) {
            onCollision = true;
            if (obj.desiredSpeed < 0)
                obj.desiredSpeed = msg.lastDesiredSpeed;

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
        }
    });

    if (!onCollision && obj.desiredSpeed > 0 && msg.speed < obj.desiredSpeed) {
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
    } else if (!onCollision && obj.desiredSpeed > 0 && msg.speed >= obj.desiredSpeed) {
        obj.desiredSpeed = -1;
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

function nameById(uuid: string) {
    if (config.red.uuid === uuid)
        return "Red";
    return "Blue";
}

scanner.findAll().then(vehicles => {

    vehicles.forEach(vehicle => {
        store[vehicle.id] = {vehicle: vehicle, desiredSpeed: -1};
        filter.addVehicle(vehicle)
    });

    filter.onUpdate((msg: PositionUpdateMessage) => {


        msg.distances.forEach(distance => {
            //console.log(nameById(msg.vehicleId) + " => " + nameById(distance.vehicle) + ":\t"
            // + distance.distance + "mm");
            antiCollision(msg);
        });
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

    ankiConsole.initializePrompt(vehicles);


}).catch(e => process.exit(1));