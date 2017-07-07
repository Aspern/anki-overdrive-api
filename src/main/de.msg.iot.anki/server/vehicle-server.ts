import * as log4js from "log4js";
import {Logger} from "log4js";
import {LifecycleComponent} from "../component/lifecycle-component";
import {Settings} from "../core/settings/settings-interface";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {Track} from "../core/track/track-interface";
import {JsonSettings} from "../core/settings/json-settings";
import {SetupConfig} from "../core/settings/setup-config";
import {VehicleScanner} from "../core/vehicle/vehicle-scanner-interface";
import {VehicleScannerImpl} from "../core/vehicle/vehicle-scanner-impl";
import Timer = NodeJS.Timer;
import logger = Handlebars.logger;
import {Threadpool} from "../component/threadpool";
import {VehicleScanTask} from "./vehicle-scan-task";
import {VehiclePipeline} from "../filter/vehicle-pipeline";
import {VehicleDataReceiver} from "../filter/vehicle-data-receiver";
import {KafkaSender} from "../filter/kafaka-sender";
import reject = Promise.reject;
import {ConsoleVehicleController} from "../controller/console-vehicle-controller";

/**
 * Server to control a setup with one track and an amount of vehicles, that belongs to the track
 * and the setup. The server manages the vehicles and the track as resources and provides access
 * to them with different components like a message queue or WebSocket.
 */
class VehicleServer implements LifecycleComponent {

    private _settings: Settings;
    private _scanner: VehicleScanner;
    private _vehicles: Array<Vehicle>;
    private _track: Track;
    private _setup: SetupConfig;
    private _logger: Logger;
    private _prompt: any;
    private _threadpool: Threadpool;
    private _pipline: VehiclePipeline;
    private _running = false;
    private _consoleController: ConsoleVehicleController;

    constructor() {
        this.initLogging();
        this.addShutdownHook();
        this._settings = new JsonSettings();
        this._track = this._settings.getAsTrack("setup.track.pieces");
        this._setup = this._settings.getAsSetup("setup");
        this._scanner = new VehicleScannerImpl(this._setup);
        this._threadpool = new Threadpool();
    }

    start(): Promise<void> {
        let me = this,
            logger = this._logger;

        logger.info("Starting vehicle-server...");

        return new Promise<void>((resolve, reject) => {
            me.searchVehicles().then(vehicles => {
                me._vehicles = vehicles;
                me._consoleController = new ConsoleVehicleController(vehicles);
                me.startVehicleScanTask();
                me.startVehiclePipeline().then(() => {
                    me.initializePrompt();
                    this._running = true;
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }

    stop(): Promise<void> {
        let logger = this._logger,
            me = this;

        logger.info("Stopping vehicle-server...");

        return new Promise<void>((resolve, reject) => {
            try {
                me._threadpool.shutdown().then(() => {
                    logger.info("Stopping threadpool...");
                    me._pipline.stop()
                        .then(() => {
                            logger.info("Stopped vehicle-pipeline.");
                            me._running = false;
                            resolve();
                        }).catch(reject);
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Searches all available vehicles in this setup.
     *
     * @return {Promise<void>|Promise} Promise holding all vehicles.
     */
    searchVehicles(): Promise<Array<Vehicle>> {
        let me = this;

        return new Promise<Array<Vehicle>>((resolve, reject) => {
            me._logger.info("Searching vehicles for this setup...");

            me._scanner.findAll()
                .then(vehicles => {
                    vehicles.forEach(vehicle => me.printVehicle(vehicle));
                    resolve(vehicles);
                }).catch(reject);
        });
    }


    /**
     * Prints vehicle information.
     *
     * @param vehicle Vehicle to print
     */
    private printVehicle(vehicle: Vehicle): void {
        this._logger.info("---------- [vehicle information] ----------");
        this._logger.info("\tuuid:\t\t" + vehicle.id);
        this._logger.info("\taddress:\t" + vehicle.address);
        this._logger.info("\tconnected:\t" + vehicle.connected);
        this._logger.info("-------------------------------------------");
    }

    /**
     * Initializes the logging environment for the server.
     */
    private initLogging(): void {
        log4js.configure({
            appenders: [
                {type: 'console'},
                {type: 'file', filename: 'logs/vehicle-server.log', category: 'vehicle-server'}
            ]
        });
        this._logger = log4js.getLogger("vehicle-server");
    }

    /**
     * Stops the server properly when the 'exit' event was emitted by NodeJS.
     */
    private addShutdownHook(): void {
        let me = this,
            logger = this._logger;

        logger.info("Adding shutdown hook.");
        process.on('exit', () => {
            if (me._running)
                me.stop()
                    .then()
                    .catch(error => {
                        logger.error("Error while executing shutdown hook.", error);
                        process.exit(1);
                    });
        });
    }

    private initializePrompt(): void {
        let me = this,
            command: string,
            params: Array<any>;

        this._prompt = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'vehicle server > '
        });


        this._prompt.prompt();
        this._prompt.on('line', (line: string) => {

            me.handleLine(line);
        });
    }

    private handleLine(line: string): void {
        let logger = this._logger,
            me = this,
            command = line.split(" ")[0],
            params = line.split(" ").slice(1);

        switch (command) {
            case "scan" :
                this._vehicles.forEach(vehicle => {
                    me.printVehicle(vehicle);
                });
                break;
            case "stop" :
                this.stop().then(() => {
                    logger.info("Stopped vehicle-server.");
                    process.exit();
                }).catch(error => {
                    logger.info("Cannot stop vehicle-server properly.", error);
                    process.exit(error);
                });
                break;
            case "restart" :
                this.stop().then(() => {
                    logger.info("Stopped vehicle-server.");
                    this.start().catch(error => {
                        console.error("Cannot start vehicle-server.", error);
                        process.exit(1);
                    });
                }).catch(error => {
                    logger.info("Cannot stop vehicle-server properly.", error);
                    process.exit(1);
                });
                break;
            case "help" :
                logger.info("vehicle-server command reference:");
                logger.info("\tstop\tStops the vehicle server.");
                logger.info("");
                logger.info("\trestart\tStops and restarts the vehicle server.");
                logger.info("");
                logger.info("\tscan\tScans and lists all found vehicles in the BLE-network.");
                break;
            default:
                me._consoleController.handleInput(line);
        }

        this._prompt.prompt();
    }

    private startVehicleScanTask(): void {
        let task = new VehicleScanTask(this._vehicles, this._scanner),
            me = this,
            logger = this._logger;

        task.onSynchronize(vehicles => {
            logger.info("Synchronizing vehicles:");
            vehicles.forEach(vehicle => me.printVehicle(vehicle));
            me._pipline.updateVehicles(vehicles);
            me._consoleController.updateVehicles(vehicles);
        });
        this._threadpool.scheduleAtFixedRate(task, 5000);
    }

    private startVehiclePipeline(): Promise<void> {
        let me = this,
            pipeline: VehiclePipeline,
            logger = this._logger;

        this._pipline = new VehiclePipeline();
        pipeline = this._pipline;

        return new Promise<void>((resolve, reject) => {
            try {

                logger.info("Creating vehicle-pipeline:");
                logger.info("\treceiver:\tVehicleDataReceiver.");
                logger.info("\tsender:\tKafkaSender.");

                pipeline.setReceiver(new VehicleDataReceiver(me._vehicles));
                pipeline.setSender(new KafkaSender());

                pipeline.start().then(() => {
                    resolve();
                }).catch(reject)

            } catch (error) {
                reject(error);
            }
        });
    }
}

let server = new VehicleServer();

server.start().catch(error => {
    console.error("Cannot start vehicle-server.", error);
    process.exit(1);
});
