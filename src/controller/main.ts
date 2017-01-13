import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {AnkiConsole} from "./console";
import {PositionUpdateMessage} from "../core/message/position-update-message";

let vehicles: Array<Vehicle>;

console.log("scanning vehicles...");

let scanner = new VehicleScanner();
let ankiConsole = new AnkiConsole();

scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    ankiConsole.initializePrompt(vehicles);

    vehicles[0].addListener((message) => {
        console.log(message);
    }, PositionUpdateMessage);
});