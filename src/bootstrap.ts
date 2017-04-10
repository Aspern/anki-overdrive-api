import * as log4js from "log4js";
import {Logger} from "log4js";
import {JsonSettings} from "./core/settings/json-settings";
import {Settings} from "./core/settings/settings-interface";
import {Setup} from "./core/setup";
import {isNullOrUndefined} from "util";
import logger = Handlebars.logger;
import {KafkaController} from "./controller/kafka/kafka-controller";
import {Vehicle} from "./core/vehicle/vehicle-interface";
import {VehicleScanner} from "./core/vehicle/vehicle-scanner";
import {Track} from "./core/track/track-interface";
import {Piece} from "./core/track/piece-interface";
import {Start} from "./core/track/start";
import {Finish} from "./core/track/finish";
import {Straight} from "./core/track/straight";
import {Curve} from "./core/track/curve";
import {KafkaVehicleController} from "./controller/kafka/kafka-vehicle-controller";
import {KafkaDistanceFilter} from "./controller/kafka/kafka-distance-filter";
import {AnkiConsole} from "./core/util/anki-console";


let bootstrap: Bootstrap;

/**
 * Shutting down bootstrap ordinary on process exit event.
 */
process.on('exit', () => {
    if (isNullOrUndefined(bootstrap)) {
        console.error("Bootstrap was not created.");
        process.exit(1);
    }
    if (bootstrap.running)
        bootstrap.stop();
});


class Bootstrap {

    private static VEHICLE_TOPIC = "vehicle-data";
    private static SETUP_TOPIC = "setup";

    private _settings: Settings;
    private _setup: Setup;
    private _logger: Logger;
    private _kafka: KafkaController;
    private _setupTopic: string;
    private _vehicles: Array<Vehicle> = [];
    private _vehicleController: Array<KafkaVehicleController> = [];
    private _distanceFilter: KafkaDistanceFilter;
    private _track: Track;
    private _running: boolean;

    constructor() {
        this._settings = new JsonSettings();
        this._setup = this._settings.getAsSetup("setup");
        this._setupTopic = "setup-" + this._setup.ean;
    }

    start(): void {
        let me = this,
            logger: Logger;

        me.init().then(() => {
            logger = me._logger;
            logger.info("Starting setup {" + me._setup.ean + "}.");
            me.searchVehiclesAndTrack().then(() => {
                me.startKafka().then(() => {
                    setTimeout(() => {
                        me._vehicles.forEach(vehicle => {
                            logger.info("Connecting vehicle {" + vehicle.id + "}.");
                            vehicle.connect().then(() => {
                                let offset = me.findInitialOffset(vehicle);
                                logger.info("Set offset {" + offset + "} for vehicle {" + vehicle.id + "}.");
                                vehicle.setOffset(offset);
                            }).catch(e => me.stop(e));

                            new AnkiConsole().initializePrompt(me._vehicles);
                            me._running = true;
                        });
                    }, 3000);
                }).catch(e => me.stop(e));
            }).catch(e => me.stop(e));
        });
    }

    stop(error?: any): void {
        let me = this,
            logger = me._logger;

        if (!isNullOrUndefined(error))
            logger.error(error)

        logger.info("Shutting down setup.");
        me._setup.online = false;
        me._running = false;

        logger.info("Shutting down controllers.");
        me._vehicleController.forEach(controller => {
            controller.stop()
                .catch(logger.error);
        });

        logger.info("Shutting down distance filter.")
        me._distanceFilter.stop()
            .catch(logger.error);

        logger.info("Disconnecting vehicles.")
        me._vehicles.forEach(vehicle => {
            vehicle.disconnect()
                .catch(logger.error);
        });

        process.exit();
    }

    get running(): boolean {
        return this._running;
    }

    private searchVehiclesAndTrack(): Promise<void> {
        let me = this,
            logger = me._logger,
            scanner = new VehicleScanner(me._setup),
            i = 1,
            track: Track;

        logger.info("Searching for vehicles in setup.");
        return new Promise<void>((resolve, reject) => {
            scanner.findAll().then(vehicles => {
                me._vehicles = vehicles;
                me._vehicles.forEach(vehicle => {
                    logger.info("\t" + i++ + "\t" + vehicle.id + "\t" + vehicle.address);
                });

                track = me._settings.getAsTrack("setup.track.pieces");

                logger.info("Searching track for setup.")
                if (isNullOrUndefined(track)) {
                    reject("No track specified in 'settings.json' > setup.track.");
                } else {
                    track.eachPiece(piece => {
                        logger.info("\t" + i++ + "\t" + piece.id + "\t(" + me.getPieceDescription(piece) + ")");
                    });
                    me._track = track;
                    resolve();
                }
            }).catch(reject);
        });
    }

    private startKafka(): Promise<void> {
        let me = this,
            logger = me._logger,
            topics = [Bootstrap.VEHICLE_TOPIC, Bootstrap.SETUP_TOPIC, me._setupTopic];

        me._vehicles.forEach(vehicle => {
            topics.push(vehicle.id);
        });

        return new Promise<void>((resolve, reject) => {
            logger.info("Starting and connecting Kafka Producer/Consumer.");

            me._kafka = new KafkaController();
            me._kafka.initializeProducer().then(online => {
                if (!online) {
                    me.stop(new Error("Kafka server is offline."));
                    return;
                }


                try {
                    logger.info("Creating topics " + topics + ".");
                    me._kafka.createProducerTopics(topics);


                    logger.info("Creating and starting vehicle controllers.");
                    me._vehicles.forEach(vehicle => {
                        let controller = new KafkaVehicleController(vehicle);
                        controller.start().then(() => {
                            me._vehicleController.push(controller);
                        }).catch(me.stop);
                    });

                    logger.info("Creating and starting distance filter.");
                    me._distanceFilter = new KafkaDistanceFilter(me._vehicles, me._track, Bootstrap.VEHICLE_TOPIC);
                    me._distanceFilter.start().then(() => {
                        resolve();
                    }).catch(e => me.stop(e));
                } catch (e) {
                    reject(e);
                }
            }).catch(reject);
        });
    }

    private findInitialOffset(vehicle: Vehicle): number {
        let me = this,
            i = 0;

        for (; i < me._setup.vehicles.length; i++)
            if (me._setup.vehicles[i].uuid === vehicle.id)
                return me._setup.vehicles[i].offset;

        return 0;
    }

    private init(): Promise<void> {
        let me = this;
        return new Promise<void>(resolve => {
            log4js.configure({
                appenders: [
                    {type: 'console'},
                    {
                        type: 'file',
                        filename: 'logs/setup-' + me._setup.ean + '.log',
                        category: 'setup'
                    }
                ]
            });
            me._logger = log4js.getLogger("Bootstrap");
            resolve();
        });
    }

    private  getPieceDescription(piece: Piece) {
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
}

bootstrap = new Bootstrap();
bootstrap.start();
