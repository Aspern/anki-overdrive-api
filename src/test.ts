import {VehicleScanner} from "./core/vehicle/vehicle-scanner";
let scanner = new VehicleScanner();

scanner.findAll().then(vehicles => {
    console.log(vehicles);
    process.exit()
}).catch(e => {
    console.error(e);
    process.exit();
});