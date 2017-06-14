import * as log4js from "log4js";
import {Logger} from "log4js";
import {LifecycleComponent} from "./lifecycle-component";
import {Settings} from "../core/settings/settings-interface";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {Track} from "../core/track/track-interface";
import {JsonSettings} from "../core/settings/json-settings";
import {SetupConfig} from "../core/settings/setup-config";
import {VehicleScanner} from "../core/vehicle/vehicle-scanner-interface";
import {VehicleScannerImpl} from "../core/vehicle/vehicle-scanner-impl";
import Timer = NodeJS.Timer;

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

    constructor() {
        this.initLogging();
        this.addShutdownHook();
        this._settings = new JsonSettings();
        this._track = this._settings.getAsTrack("setup.track.pieces");
        this._setup = this._settings.getAsSetup("setup");
        this._scanner = new VehicleScannerImpl(this._setup);
    }

    start(): Promise<void> {
        let me = this,
            logger = this._logger;

        logger.info("Starting vehicle-server...");

        return new Promise<void>((resolve, reject) => {
            me.searchVehicles().then(vehicles => {
                me._vehicles = vehicles;
                resolve();
            }).catch(reject);
        });
    }

    stop(): Promise<void> {
        let me = this,
            logger = this._logger;

        logger.info("Stopping vehicle-server...");

        return new Promise<void>(resolve => {
            resolve();
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
            me.stop()
                .then()
                .catch(error => {
                    logger.error("Error while executing shutdown hook.", error);
                    process.exit(1);
                });
        });
    }
}

let server = new VehicleServer();

server.start().catch(error => {
    console.error("Cannot start vehicle-server.", error);
    process.exit(1);
});
