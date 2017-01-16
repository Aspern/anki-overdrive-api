import {VehicleScanner} from "../core/vehicle/vehicle-scanner";

let scanner = new VehicleScanner();

scanner.findAll().then(console.log).catch(console.error);