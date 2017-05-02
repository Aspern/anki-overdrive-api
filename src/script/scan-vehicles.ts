import {VehicleScannerImpl} from "../core/vehicle/vehicle-scanner-impl";
import {JsonSettings} from "../core/settings/json-settings";

let settings = new JsonSettings(),
    setup = settings.getAsSetup("setup"),
    scanner = new VehicleScannerImpl(setup),
    onError = (e: Error) => {
        console.error(e);
        process.exit(1);
    };

scanner.findAll().then((vehicles) => {
    console.log(vehicles);
    process.exit(0);
}).catch(onError);