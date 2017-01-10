import {VehicleScanner} from "./src/core/vehicle-scanner";

let scanner = new VehicleScanner();

scanner.findById("eb401ef0f82b").then((vehicle) => {
    vehicle.connect().then(() => {
        vehicle.setSpeed(500);
    }).catch(console.error);
});



