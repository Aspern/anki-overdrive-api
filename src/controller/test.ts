import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {AnkiConsole} from "../core/util/anki-console";
let scanner = new VehicleScanner(),
    con = new AnkiConsole();

scanner.findAll().then(vehicles => {
    con.initializePrompt(vehicles);
}).catch(e => {
    console.error(e);
    process.exit();
});