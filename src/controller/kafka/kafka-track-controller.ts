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
import {Scenario} from "../scenario/scenario-interface";
import {CollisionScenario} from "../scenario/collision-scenario";
import {LightConfig} from "../../core/vehicle/light-config";
import {AntiCollisionScenario} from "../scenario/anti-collision-scenario";
import {MaxSpeedScenario} from "../scenario/max-speed-scenario";

let settings: Settings = new JsonSettings(),
    scanner = new VehicleScanner(),
    setup: Setup = settings.getAsSetup("setup"),
    track = settings.getAsTrack("track"),
    vehicleConfig: Array<{ offset: number, vehicle: Vehicle }> = [],
    usedVehicles: Array<Vehicle> = [],
    vehicleControllers: Array<KafkaVehicleController> = [],
    filter: KafkaDistanceFilter,
    kafkaController = new KafkaController(),
    ankiConsole = new AnkiConsole(),
    scenario: Scenario;

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
    vehicleConfig.forEach(config => {
        config.vehicle.disconnect();
    });
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

function initializeVehicles(handler?: (vehicle: Vehicle) => any) {
    vehicleConfig.forEach(config => {
        config.vehicle.setOffset(config.offset);
        config.vehicle.setLights([
            new LightConfig()
                .blue()
                .steady(),
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .red()
                .steady(0)
        ]);
        config.vehicle.setLights([
            new LightConfig()
                .tail()
                .steady(0),
            new LightConfig()
                .front()
                .steady(0),
            new LightConfig()
                .weapon()
                .steady(0)
        ]);

        if (!isNullOrUndefined(handler))
            handler(config.vehicle);
    });
}

function createScneario(name: string) {
    switch (name) {
        case  'collision':
            return new CollisionScenario(usedVehicles[0], usedVehicles[1])
        case 'anti-collision:':
            return new AntiCollisionScenario(usedVehicles[0], usedVehicles[1]);
        case 'max-speed' :
            return new MaxSpeedScenario(usedVehicles[0]);
        default:
            return null;
    }
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
                if (config.uuid === vehicle.id) {
                    vehicleConfig.push({
                        offset: config.offset,
                        vehicle: vehicle
                    });
                    usedVehicles.push(vehicle);
                }
            });
        });

        if (vehicleConfig.length === 0) {
            console.log("No vehicles found for this setup.");
            process.exit();
        }

        if (isNullOrUndefined(track)) {
            console.log("No track found for this setup");
            process.exit()
        }


        console.log("Found " + vehicleConfig.length + " vehicles:");
        let i = 1;
        vehicleConfig.forEach(config => {
            let v = config.vehicle;
            let controller = new KafkaVehicleController(v);
            console.log("\t" + i++ + "\t" + v.id + "\t" + v.address);

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

        usedVehicles.forEach(vehicle => vehicle.connect());

        // Wait 3 seconds before interacting with the resources.
        setTimeout(() => {
            initializeVehicles(vehicle => {
                setInterval(() => {
                    vehicle.queryBatteryLevel();
                }, 1000);
            });

            setup.online = true;
            kafkaController.sendPayload([{
                topic: "setup",
                partitions: 1,
                messages: JSON.stringify(setup).replace(/_/g, "")
            }]);

            kafkaController.initializeConsumer([{topic: "scenario", partition: 0}], 0);
            kafkaController.addListener(message => {
                let info: { name: string, interrupt: boolean } = JSON.parse(message.value);
                if (info.interrupt && !isNullOrUndefined(scenario)) {
                    scenario.interrupt().then(() => {
                        console.info("Interrupted scenario '" + info.name + "'.");
                    }).catch(handleError);
                } else {
                    if (scenario.isRunning()) {
                        console.error("Another scenario is still running!");
                    } else {
                        scenario = createScneario(info.name);
                        scenario.start().then(() => {
                            initializeVehicles();
                            console.log("Finished scenario.")
                        }).catch(handleError);
                        console.log("Started scenario.");
                    }
                }
            });

            console.log("Waiting for messages.");
            ankiConsole.initializePrompt(usedVehicles);
        }, 3000);

    }).catch(handleError);

}).catch(handleError);





