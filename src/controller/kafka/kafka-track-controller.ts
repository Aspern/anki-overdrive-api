import {Settings} from "../../core/settings/settings-interface";
import {JsonSettings} from "../../core/settings/json-settings";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {isNullOrUndefined} from "util";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {KafkaVehicleController} from "./kafka-vehicle-controller";
import {KafkaDistanceFilter} from "./kafka-distance-filter";

let settings: Settings = new JsonSettings(),
    scanner = new VehicleScanner(),
    track = settings.getAsTrack("track"),
    configs: Array<{uuid: string, name: string, color: string}> = settings.getAsObject("vehicles"),
    usedVehicles: Array <Vehicle> = [],
    vehicleControllers: Array<KafkaVehicleController> = [],
    filter: KafkaDistanceFilter;

function handleError(e: Error): void {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}

configs.forEach(config => {

    scanner.findAll().then(vehicles => {
        vehicles.forEach(vehicle => {
            configs.forEach(config => {
                if (config.uuid === vehicle.id)
                    usedVehicles.push(vehicle);
            });
        });

        usedVehicles.forEach(vehicle => {
            let controller = new KafkaVehicleController(vehicle);

            controller.start().then(() => {
                vehicleControllers.push(controller);
            }).catch(handleError);
        });

        filter = new KafkaDistanceFilter(usedVehicles, track);
        filter.start().catch(handleError);
    });

});