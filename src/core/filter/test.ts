import {JsonSettings} from "../../settings/json-settings";
import {SimpleDistanceFilter} from "./simple-distance-filter";
import {VehicleScanner} from "../vehicle/vehicle-scanner";
import {AnkiConsole} from "../../controller/console";
import {Distance} from "./distance";
import {Vehicle} from "../vehicle/vehicle-interface";

let scanner = new VehicleScanner(),
    settings = new JsonSettings(),
    track = settings.getAsTrack("track"),
    filter = new SimpleDistanceFilter(),
    controller = new AnkiConsole(),
    vehicleStore: {[key: string]: Vehicle} = {},
    desiredSpeedStore : {[key:string]:number} = {};


function antiCollision(vehicle: Vehicle, distances: Array<Distance>): void {
    distances.forEach(distance => {
        // Vehicle might collide
        if (distance.vertical <= 34) {

        }
    });
}


scanner.findAll().then(vehicles => {

    filter.init([track, vehicles]);

    filter.onUpdate(output => {
        antiCollision(vehicleStore[output.vehicleId], output.distances);
    });

    vehicles.forEach(vehicle => {
        vehicleStore[vehicle.id] = vehicle;
    });

    filter.start().then(() => {
        controller.initializePrompt(vehicles);
    });

}).catch(e => {
    console.error(e);
    process.exit();
});
