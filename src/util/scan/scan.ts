import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";

let scanner = new VehicleScanner(),
    onError = (e: Error) => {
        console.error(e);
        process.exit(1);
    };

scanner.findAll().then((vehicles) => {
    console.log(vehicles);
    process.exit(0);
}).catch(onError);