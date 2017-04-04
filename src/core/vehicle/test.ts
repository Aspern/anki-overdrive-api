import {VehicleScanner} from "./vehicle-scanner";
import {isNullOrUndefined} from "util";
let scanner = new VehicleScanner();

function handleError(e: Error) {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}

scanner.findAny().then(vehicle => {


    vehicle.connect().then(() => {
        vehicle.accelerate(800, 0.1);


        setTimeout(() => {
            vehicle.brake(0.7);
        }, 11000);

        setTimeout(() => {
            vehicle.setSpeed(0, 1500);
        }, 18000);

        setTimeout(() => {
            vehicle.disconnect();
            process.exit();
        }, 20000);

    }).catch(handleError);


}).catch(handleError);