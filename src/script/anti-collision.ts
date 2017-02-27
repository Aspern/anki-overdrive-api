import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {JsonSettings} from "../core/settings/json-settings";
import {SimpleDistanceFilter} from "../core/filter/simple-distance-filter";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/position-update-message";
import {AnkiConsole} from "../core/util/anki-console";
import {Distance} from "../core/filter/distance";
import {isNullOrUndefined} from "util";
import {LightConfig} from "../core/vehicle/light-config";

let scanner = new VehicleScanner(),
    settings = new JsonSettings(),
    ankiConsole = new AnkiConsole(),
    track = settings.getAsTrack("track"),
    filter = new SimpleDistanceFilter(),
    store: {[key: string]: {speed: number, vehicle: Vehicle}} = {};

function driveNormal(message: PositionUpdateMessage): void {
    let record = store[message.vehicleId];

    if (message.speed - 20 < record.speed)
        speedUp(message);
    else
        record.vehicle.setLights([
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

function brake(message: PositionUpdateMessage) {
    let record = store[message.vehicleId];

    record.vehicle.setSpeed(message.speed - 50, 200);
    record.vehicle.setLights([
        new LightConfig()
            .green()
            .steady(0),
        new LightConfig()
            .red()
            .steady(),
        new LightConfig()
            .blue()
            .steady(0)
    ]);
}

function speedUp(message: PositionUpdateMessage) {
    let record = store[message.vehicleId];

    record.vehicle.setSpeed(record.speed, 50);
    record.vehicle.setLights([
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
}

function handleAntiCollision(message: PositionUpdateMessage, distance: Distance): boolean {
    if (distance.horizontal <= 500) {
        brake(message);
    } else if (distance.horizontal > 700) {
        driveNormal(message);
    }

    return true;
}

function supervise(message: PositionUpdateMessage): void {
    let distances = message.distances,
        onCollision = false;

    distances.forEach(distance => {
        if (!isNullOrUndefined(distance.delta)
            && distance.delta < 0
            && distance.vertical <= 34)
            onCollision = handleAntiCollision(message, distance);
    });

    if (!onCollision)
        driveNormal(message);
}

scanner.findAll().then(vehicles => {

    vehicles.forEach(vehicle => {
        store[vehicle.id] = {
            speed: 0,
            vehicle: vehicle
        };
    });

    filter.init([track, vehicles]);
    filter.onUpdate(supervise);
    filter.start();

    ankiConsole.onCommand((cmd, params, vehicle) => {
        if (cmd === 's')
            store[vehicle].speed = parseInt(params[0]);
    }).initializePrompt(vehicles);
}).catch(e => {
    console.error(e);
    process.exit();
});
