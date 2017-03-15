import {Settings} from "../../core/settings/settings-interface";
import {JsonSettings} from "../../core/settings/json-settings";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {isNullOrUndefined} from "util";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {KafkaVehicleController} from "./kafka-vehicle-controller";
import {KafkaDistanceFilter} from "./kafka-distance-filter";
import {AnkiConsole} from "../../core/util/anki-console";
import {Piece} from "../../core/track/piece-interface";
import {Start} from "../../core/track/start";
import {Finish} from "../../core/track/finish";
import {Straight} from "../../core/track/straight";
import {Curve} from "../../core/track/curve";

let settings: Settings = new JsonSettings(),
    scanner = new VehicleScanner(),
    track = settings.getAsTrack("track"),
    configs: Array<{uuid: string, name: string, color: string}> = settings.getAsObject("vehicles"),
    usedVehicles: Array <Vehicle> = [],
    vehicleControllers: Array<KafkaVehicleController> = [],
    filter: KafkaDistanceFilter,
    ankiConsole = new AnkiConsole();

function handleError(e: Error): void {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}

function getPieceDescription(piece : Piece) {
    if(piece instanceof Start)
        return "Start";
    else if(piece instanceof Finish)
        return "Finish";
    else if(piece instanceof Straight)
        return "Straight";
    else if(piece instanceof Curve)
        return "Curve";
    return "Undefined";
}


console.log("Searching for vehicles in the setup...");
scanner.findAll().then(vehicles => {
    console.log(vehicles.length);
    vehicles.forEach(vehicle => {
        configs.forEach(config => {
            if (config.uuid === vehicle.id)
                usedVehicles.push(vehicle);
        });
    });

    if(usedVehicles.length === 0) {
        console.log("No vehicles found for this setup.");
        process.exit();
    }

    if(isNullOrUndefined(track)) {
        console.log("No track found for this setup");
        process.exit()
    }


    console.log("Found " + usedVehicles.length + " vehicles:");
    let i = 1;
    usedVehicles.forEach(vehicle => {
        let controller = new KafkaVehicleController(vehicle);
        console.log("\t" + i++ + "\t" + vehicle.id + "\t" + vehicle.address);

        controller.start().then(() => {
            vehicleControllers.push(controller);
        }).catch(handleError);
    });

    i = 0;

    console.log("Found 1 track for setup:")
    track.eachPiece(piece => {
        console.log("\t" + i++ + "\t" + piece.id + "\t(" + getPieceDescription(piece) + ")");
    });

    console.log("Starting distance filter...");
    filter = new KafkaDistanceFilter(usedVehicles, track);
    filter.start().catch(handleError);

    console.log("Waiting for messages.");
}).catch(handleError);



