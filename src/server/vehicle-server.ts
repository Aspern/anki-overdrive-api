import * as log4js from "log4js";
import {LifecycleComponent} from "./lifecycle-component";
import {Settings} from "../main/de.msg.iot.anki/core/settings/settings-interface";
import {Vehicle} from "../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {Track} from "../main/de.msg.iot.anki/core/track/track-interface";
import {JsonSettings} from "../main/de.msg.iot.anki/core/settings/json-settings";
import {SetupConfig} from "../main/de.msg.iot.anki/core/settings/setup-config";
import {Logger} from "log4js";
import {isNullOrUndefined} from "util";
import Timer = NodeJS.Timer;
import {VehicleScanner} from "../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-interface";
import {VehicleScannerImpl} from "../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-impl";

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
    private _autoScanTask: Timer;

    constructor() {
        this.initLogging();
        this.addShutdownHook();
        this._settings = new JsonSettings();
        this._track = this._settings.getAsTrack("setup.track.pieces");
        this._setup = this._settings.getAsSetup("setup");
        this._scanner = new VehicleScannerImpl(this._setup);


    }

    start(): Promise<void> {
        let me = this;

        this._logger.info("Starting vehicle-server...");

        return new Promise<void>((resolve, reject) => {
            me.searchVehicles().then(() => {
                resolve();
            }).catch(error => {
                if (!isNullOrUndefined(me._logger)) {
                    me._logger.error("Errors while starting vehicle-server.", error);
                    process.exit();
                    resolve();
                } else
                    reject();
            });
        });
    }

    stop(): Promise<void> {
        let me = this;

        this._logger.info("Stopping vehicle-server...");

        return new Promise<void>(resolve => {

            if (!isNullOrUndefined(me._autoScanTask))
                clearInterval(me._autoScanTask);

            resolve();
        });
    }

    /**
     * Searches all vehicles that belongs to this setup and adds them as resource.
     */
    searchVehicles(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            me._logger.info("Searching vehicles for this setup...");

            me._scanner.findAll()
                .then(vehicles => {
                    me._vehicles = vehicles;
                    me.showVehicles();
                    resolve();
                }).catch(reject);
        });
    }

    /**
     * Prints all vehicles that are listed as a resource to the console or log.
     */
    showVehicles(): void {
        let me = this;
        this._vehicles.forEach(vehicle => me.printVehicle(vehicle));
    }


    /**
     * Prints vehicle information to the log.
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
        let me = this;
        process.on('exit', () => {
            let closed = false;

            me.stop()
                .then(() => {
                    me._logger.info("Closed");
                    closed = true;
                })
                .catch(e => {
                    if (!isNullOrUndefined(me._logger)) {
                        me._logger.error("Errors while starting vehicle-server.", e);
                        process.exit(1);
                    }
                });

            //TODO: Solve problem with async resource closing.
        });
    }
}

let server = new VehicleServer();

server.start().catch(e => {
    console.error("Cannot start vehicle-server", e);
    process.exit(1);
});
