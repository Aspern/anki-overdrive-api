import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {SimpleDistanceFilter} from "../core/filter/simple-distance-filter";
import {JsonSettings} from "../core/settings/json-settings";
import {isNullOrUndefined} from "util";
import {Vehicle} from "../core/vehicle/vehicle-interface";

let scanner = new VehicleScanner(),
    settings = new JsonSettings(),
    track = settings.getAsTrack("track"),
    filter = new SimpleDistanceFilter(),
    timeout = 10000,
    store: Array<{
        timestamp: Date,
        distance: number,
        to: string,
        speed: number,
        from: string
    }> = [],
    vehcs: Array<Vehicle>;


function onError(e: Error): void {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}

scanner.findAll().then(vehicles => {

    vehcs = vehicles;

    filter.init([track, vehcs]);
    filter.onUpdate(output => {
        output.distances.forEach(distance => {
            store.push({
                timestamp: output.timestamp,
                distance: distance.horizontal,
                from: output.vehicleId,
                speed: output.speed,
                to: distance.vehicle
            });
        });
    });
    filter.start().then(() => {
        vehcs.forEach(vehicle => {
            vehicle.connect().then(v => {

                v.setOffset(68.0);
                v.setSpeed(400, 200);
            });
        });

        setTimeout(() => {
            vehcs.forEach(vehicle => {
                vehicle.setSpeed(0, 200);
                vehicle.disconnect();
            });
        }, timeout);

        setTimeout(() => {
            console.log(store);
            process.exit();
        }, timeout + 2000);
    });


}).catch(onError);