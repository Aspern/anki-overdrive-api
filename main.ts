import {VehicleScanner} from "./src/core/vehicle/vehicle-scanner";
import {VehicleMessage} from "./src/core/message/vehicle-message";
import {VehicleDelocalizedMessage} from "./src/core/message/vehicle-delocalized-message";

let scanner = new VehicleScanner();

scanner.findById("ed0c94216553").then((vehicle) => {
    vehicle.connect().then(() => {
        vehicle.addListener((message: VehicleMessage) =>{
               console.log(message);
        }, VehicleDelocalizedMessage);
        vehicle.setSpeed(2000);
    }).catch(console.error);
}).catch(console.error);







