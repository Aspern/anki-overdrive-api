import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
var scanner = new VehicleScanner();

scanner.findById("cb73ac40502a").then((vehicle) => {

    vehicle.connect().then(() => {
        vehicle.setSpeed(500, 300);

        vehicle.addListener((message) => {
           console.log(message)
        });

        // Disconnect the vehicle after 1 minute.
        setTimeout(() => {
            vehicle.disconnect();
        }, 60000);
    });
});