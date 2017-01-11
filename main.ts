import {VehicleScanner} from "./src/core/vehicle-scanner";

let scanner = new VehicleScanner();

scanner.findById("eb401ef0f82b").then((vehicle) => {
    vehicle.connect().then(() => {
        vehicle.queryPing().then(console.log).catch(console.error);
    }).catch(console.error);
});



