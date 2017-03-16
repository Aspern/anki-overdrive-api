import {Settings} from "../../core/settings/settings-interface";
import {JsonSettings} from "../../core/settings/json-settings";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {isNullOrUndefined} from "util";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {KafkaVehicleController} from "./kafka-vehicle-controller";
import {KafkaDistanceFilter} from "./kafka-distance-filter";
import {Piece} from "../../core/track/piece-interface";
import {Start} from "../../core/track/start";
import {Finish} from "../../core/track/finish";
import {Straight} from "../../core/track/straight";
import {Curve} from "../../core/track/curve";
import {KafkaController} from "./kafka-controller";
import {Setup} from "../../core/setup";
import {AnkiConsole} from "../../core/util/anki-console";

let settings: Settings = new JsonSettings(),
    scanner = new VehicleScanner(),
    setup: Setup = settings.getAsSetup("setup"),
    track = settings.getAsTrack("track"),
    usedVehicles: Array <Vehicle> = [],
    vehicleControllers: Array<KafkaVehicleController> = [],
    filter: KafkaDistanceFilter,
    kafkaController = new KafkaController(),
    ankiConsole = new AnkiConsole();

function handleError(e: Error): void {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}


process.on('exit', () => {
    setup.online = false;
    kafkaController.sendPayload([{
        topic: "setup",
        partitions: 1,
        messages: JSON.stringify(setup).replace(/_/g, "")
    }]);
    usedVehicles.forEach(vehicle => {
        vehicle.disconnect();
    })
});

function getPieceDescription(piece: Piece) {
    if (piece instanceof Start)
        return "Start";
    else if (piece instanceof Finish)
        return "Finish";
    else if (piece instanceof Straight)
        return "Straight";
    else if (piece instanceof Curve)
        return "Curve";
    return "Undefined";
}

console.log("Starting Kafka Producer...");
kafkaController.initializeProducer().then(online => {
    if (!online) {
        console.error("Kafka Server is not running.");
        process.exit();
    }

    console.log("Searching for vehicles in the setup...");
    scanner.findAll().then(vehicles => {
        console.log(vehicles.length);
        vehicles.forEach(vehicle => {
            setup.vehicles.forEach(config => {
                if (config.uuid === vehicle.id)
                    usedVehicles.push(vehicle);
            });
        });

        if (usedVehicles.length === 0) {
            console.log("No vehicles found for this setup.");
            process.exit();
        }

        if (isNullOrUndefined(track)) {
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

        usedVehicles.forEach(vehicle => {
            vehicle.connect().then(() => {
                setup.vehicles.forEach(config => {
                    if (vehicle.id === config.uuid)
                        vehicle.setOffset(config.offset);
                });
            });
        });

        // Wait 3 seconds before interacting with the resources.
        setTimeout(() => {
            setup.online = true;
            kafkaController.sendPayload([{
                topic: "setup",
                partitions: 1,
                messages: JSON.stringify(setup).replace(/_/g, "")
            }]);

            console.log("Waiting for messages.");
            ankiConsole.initializePrompt(usedVehicles);
        }, 3000);

    }).catch(handleError);

}).catch(handleError);





