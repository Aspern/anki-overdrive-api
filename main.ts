import {VehicleScanner} from "./src/vehicle/vehicle-scanner";

let scanner = new VehicleScanner();

scanner.findAll().then((vehicles) => {
    console.log(vehicles);
});



