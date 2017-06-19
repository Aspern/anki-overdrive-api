import {Settings} from "../../core/settings/settings-interface";
import {JsonSettings} from "../../core/settings/json-settings";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {isNullOrUndefined} from "util";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
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
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import * as log4js from "log4js";
import {KafkaVehicleController} from "./kafka-vehicle-controller";
import {WebSocketController} from "../websocket/websocket-controller";
import {KafkaRoundFilter} from "./kafka-round-filter";
import {ProfitScenario} from "../scenario/profit-scenario";
/// <reference path="../../../decl/jsonfile.d.ts"/>

let settings: Settings = new JsonSettings(),
    setup: Setup = settings.getAsSetup("setup"),
    scanner = new VehicleScanner(setup),
    track = settings.getAsTrack("setup.track.pieces"),
    usedVehicles: Array<Vehicle> = [],
    vehicleControllers: Array<KafkaVehicleController> = [],
    distanceFilter: KafkaDistanceFilter,
    roundFilters: Array<KafkaRoundFilter> = [],
    kafkaController = new KafkaController(),
    ankiConsole = new AnkiConsole(),
    websocket: WebSocketController,
    scenario: Scenario,
    resetTimeouts: { [key: string]: number } = {
        "eb401ef0f82b": 0,
        "ed0c94216553": 1000
    },
    simpleBarrier = require("simple-barrier"),
    barrier = new simpleBarrier(),
    readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'ANKI >'
});


log4js.configure({
    appenders: [
        {type: 'console'},
        {type: 'file', filename: 'logs/setup.log', category: 'setup'}
    ]
});

process.setMaxListeners(100);

let logger = log4js.getLogger("setup");

function handleError(e: Error): void {
    if (!isNullOrUndefined(e)) {
        console.error(e);
        process.exit();
    }
}
process.on('exit', () => {
    setup.online = false;
    let message = JSON.stringify(setup).replace(/_/g, "");
    logger.info("Shutting down setup: " + message);
    kafkaController.sendPayload([{
        topic: "setup",
        partitions: 1,
        messages: message
    }]);

    logger.info("Interrupting running scenario.");
    if (!isNullOrUndefined(scenario) && scenario.isRunning())
        scenario.interrupt().catch(e => logger.error("Error while interrupting scenario", e));

    logger.info("Disconnecting vehicles...");
    usedVehicles.forEach(vehicle => {
        vehicle.disconnect();
    });

    logger.info("Setup disconnected.");
});

// Because many listeners are used in process.
process.setMaxListeners(1000);

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


function findStartLane() {
    let counters: { [key: string]: number } = {};
    usedVehicles.forEach(vehicle => {
        counters[vehicle.id] = 0;
        let listener = (message: PositionUpdateMessage) => {
            if (message.piece === 34 && message.position === 0 && counters[message.vehicleId] === 1) {
                vehicle.removeListener(listener);
                counters[message.vehicleId] = 0;
                vehicle.setSpeed(0, 1000);
                vehicle.setLights([
                    new LightConfig()
                        .blue()
                        .steady(),
                    new LightConfig()
                        .green()
                        .steady(0),
                    new LightConfig()
                        .weapon()
                        .steady(0)
                ]);
            } else if (message.piece === 34 && message.position === 0)
                counters[message.vehicleId] = 1;
        };

        vehicle.addListener(listener);
        vehicle.setLights([
            new LightConfig()
                .blue()
                .steady(0),
            new LightConfig()
                .green()
                .flash(0, 10, 10),
            new LightConfig()
                .weapon()
                .flash(0, 10, 10)
        ]);
        setTimeout(() => {

            setup.vehicles.forEach(config => {
                if (config.uuid === vehicle.id) {
                    vehicle.setSpeed(500, 250);
                    setTimeout(() => {
                        vehicle.changeLane(config.offset);
                    }, 2000);
                }

            });
        }, resetTimeouts[vehicle.id] || 0);
    });
}


function createScenario(name: string) {
    switch (name) {
        case  'collision':
            //return new CollisionScenario(usedVehicles[0], usedVehicles[1]);
            return new ProfitScenario(usedVehicles[0], track);
        case 'anti-collision':
            return new AntiCollisionScenario(usedVehicles[0], usedVehicles[1]);
        case 'max-speed' :
            return new MaxSpeedScenario(usedVehicles[0]);
        default:
            return null;
    }
}

logger.info("Starting setup...")
logger.info("Starting Kafka Producer...");
kafkaController.initializeProducer().then(online => {
    if (!online) {
        logger.error("Kafka Server is not running.");
        process.exit();
    }

    logger.info("Searching vehicles...");
    scanner.findAll().then(vehicles => {
        vehicles.forEach(vehicle => {
            setup.vehicles.forEach(config => {
                if (config.uuid === vehicle.id) {
                    vehicle.initialOffset = config.offset;
                    vehicle.name = config.name;
                }
            });
            usedVehicles.push(vehicle);
        });

        if (usedVehicles.length === 0) {
            logger.info("No vehicles found for this setup.");
            process.exit();
        }

        if (isNullOrUndefined(track)) {
            logger.info("No track found for this setup");
            process.exit()
        }


        logger.info("Found " + usedVehicles.length + " vehicles:");
        let i = 1;
        usedVehicles.forEach(vehicle => {
            let controller = new KafkaVehicleController(vehicle);
            logger.info("\t" + i++ + "\t" + vehicle.name + "\t" + vehicle.id + "\t" + vehicle.address + "\t(" + vehicle.initialOffset + "mm)");

            controller.start().then(() => {
                vehicleControllers.push(controller);
            }).catch(handleError);
        });

        i = 0;

        logger.info("Found 1 track for setup:")
        track.eachPiece(piece => {
            logger.info("\t" + i++ + "\t" + piece.id + "\t(" + getPieceDescription(piece) + ")");
        });

        logger.info("Starting distance-filter...");
        distanceFilter = new KafkaDistanceFilter(usedVehicles, track, "vehicle-data");
        distanceFilter.start().catch(handleError);

        logger.info("Starting message-quality-filters...");
        usedVehicles.forEach(vehicle => {
            let filter = new KafkaRoundFilter(vehicle, track, "vehicle-data");
            filter.start().catch(e => logger.error(e));
            roundFilters.push(filter);
        });


        websocket = new WebSocketController(usedVehicles, 4711);
        setup.online = true;

        let message = JSON.stringify(setup).replace(/_/g, "");

        logger.info("Sending setup to 'setup': " + message);
        kafkaController.sendPayload([{
            topic: "setup",
            partitions: 1,
            messages: message
        }]);

        logger.info("Initializing Kafka Consumer for topic 'scenario'...");

        kafkaController.initializeConsumer([{topic: "scenario", partition: 0}], 0);
        kafkaController.addListener(message => {
            let info: { name: string, interrupt: boolean } = JSON.parse(message.value);
            logger.info("Received message from server: " + JSON.stringify(message));
            if (info.interrupt && !isNullOrUndefined(scenario)) {
                scenario.interrupt().then(() => {
                    scenario = null;
                    distanceFilter.unregisterUpdateHandler();
                    findStartLane();
                    logger.info("Interrupted scenario '" + info.name + "'.");
                }).catch(handleError);
            } else {
                if (!isNullOrUndefined(scenario) && scenario.isRunning()) {
                    logger.warn("Another scenario is still running!");
                } else {
                    try {
                        scenario = createScenario(info.name);
                    } catch (e) {
                        logger.error("Unable to create scenario.", e);
                    }

                    if (isNullOrUndefined(scenario)) {
                        logger.error("Unknown Scenario for config: " + info);
                    } else {
                        distanceFilter.registerUpdateHandler(scenario.onUpdate, scenario);
                        scenario.start().then(() => {
                            logger.info("Starting scenario: " + scenario)
                        }).catch(e => logger.error("Cannot start scenario.", e));
                    }
                }
            }
        });

        logger.info("Waiting for messages.");
        //ankiConsole.initializePrompt(usedVehicles);


        /// PROTOTYPE
        vehicles[0].connect().then(() => {
            scenario = new ProfitScenario(usedVehicles[0], track);
            distanceFilter.registerUpdateHandler(scenario.onUpdate, scenario);
            scenario.start().then(() => {
                logger.info("Starting scenario: " + scenario)
            }).catch(e => logger.error("Cannot start scenario.", e));
           // vehicles[0].setSpeed(769, 1500)
        })


        rl.prompt();
        rl.on('line', (line: string) => {
            if (line === 'pl') {
                vehicleControllers.forEach(controller => {
                    controller.printLatencies();
                });
            } else if (line === 'al') {
                vehicleControllers.forEach(controller => {
                    controller.avgLatencies();
                });
            } else if (line === 'cl') {
                vehicleControllers.forEach(controller => {
                    controller.clearLatencies();
                });
            } else if (line === 'ml') {
                vehicleControllers.forEach(controller => {
                    controller.medianLatencies();
                });
            } else {
                console.error("'" + line + "' is not a known command.")
            }
        });


    }).catch(handleError);
}).catch(handleError);





