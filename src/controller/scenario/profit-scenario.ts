/// <reference path="../../../decl/jsonfile.d.ts"/>
import {Scenario} from "./scenario-interface";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import * as files from "jsonfile";
import {Track} from "../../core/track/track-interface";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import {isNullOrUndefined} from "util";
import {MongoClient} from "mongodb";
import * as log4js from "log4js";


interface Command {
    timestamp: Date;
    p_1: string;
    p_2: string;
    d_t: number;
    a_i1: number;
    v_i: number;
    v_o: number;
}

class ProfitScenario implements Scenario {

    private _running = false;
    private _vehicle: Vehicle;
    private _accelerations: { [key: string]: number } = {};
    private _optimalSpeeds: { [key: string]: number } = {};
    private _track: Track;
    private _initialized = false;
    private _previousCommand: Command;
    private _logger: log4js.Logger;

    constructor(vehicle: Vehicle, track: Track) {
        this._logger = log4js.getLogger("profit-scenario");
        this._vehicle = vehicle;
        this._track = track;
        this._optimalSpeeds = files.readFileSync("resources/optimal-speeds.json");
        this.calculateAccelerations();
    }

    private calculateAccelerations(): void {
        let me = this,
            optimalSpeeds = this._optimalSpeeds,
            track = this._track,
            logger = this._logger;

        MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
            if (!isNullOrUndefined(error))
                logger.error("Cannot connect [mongodb://localhost:27017/anki]", error);

            for (let lane = 14; lane < 16; lane++)
                track.eachTransition((t1, t2) => {
                    let p1 = t1[0] + ":" + t1[1],
                        p2 = t2[0] + ":" + t2[1],
                        ve = optimalSpeeds[p2],
                        v0 = optimalSpeeds[p1],
                        key = t1[0] + "" + t1[1] + "" + t2[0] + "" + t2[1],
                        s: number,
                        a: number;

                    let collection = db.collection("distances");

                    collection.find({key: key}).toArray((error, docs) => {
                        if (!isNullOrUndefined(error))
                            logger.error("Unable to find: " + key + ":", error);


                        try {
                            s = docs[0].avg;
                            a = (Math.pow(ve, 2) - Math.pow(v0, 2)) / (2 * s);
                            a = Math.abs(Math.round(a));

                            me._accelerations[p1] = a;
                        } catch (error) {
                            logger.error("Cannot calculate acceleration for [" + key + "].", error);
                        }
                    });
                }, lane);
        });

        setTimeout(() => {
            logger.info(JSON.stringify(me._accelerations));
        }, 5000);
    }


    start(): Promise<void> {
        let vehicle = this._vehicle,
            me = this,
            logger = this._logger;

        this._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                vehicle.setSpeed(600, 600);
                setTimeout(() => {
                    //vehicle.changeLane(68);

                    MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
                        if (!isNullOrUndefined(error))
                            logger.error("Cannot connect [mongodb://localhost:27017/anki]", error);

                        let collection = db.collection("acceleration-commands");
                        collection.drop().then(() => {
                            setTimeout(() => {
                                me._initialized = true;
                            }, 2000);
                        }).catch(error => {
                            logger.error("Cannot drop collection [acceleration-commands].", error);
                            me._initialized = true;
                        });
                    });
                }, 3000);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }


    onUpdate(message: VehicleMessage): void {
        if (this._initialized && message instanceof PositionUpdateMessage) {
            let position = message.piece + ":" + message.location,
                vehicle = this._vehicle,
                optimalSpeed = this._optimalSpeeds[position],
                acceleration = this._accelerations[position],
                previousCommand = this._previousCommand,
                logger = this._logger,
                offset = message.offset;

            if (offset <= 59.5 || isNullOrUndefined(optimalSpeed) || isNullOrUndefined(acceleration)) {
                logger.warn("vehicle is not on lane [offset=" + offset + ", position=" + position + "].");
                vehicle.setOffset(offset);
                vehicle.changeLane(68.0);
                return;
            }

            switch (position) {
                case "20:36":
                    vehicle.setSpeed(1100, 1500);
                    break;
                case "33:15":
                    vehicle.setSpeed(650, 1500);
                    break;
                case "23:36":
                    vehicle.setSpeed(1100, 1500);
                    break;
                case "36:47":
                    vehicle.setSpeed(650, 1500);
                    break;
            }


            // if (isNullOrUndefined(optimalSpeed) || isNullOrUndefined(acceleration)) {
            //     vehicle.setOffset(59.5);
            //     vehicle.changeLane(68);
            //     logger.warn("Vehicle not on lane.");
            //     return;
            // }
            //
            //
            // let command: Command = {
            //     timestamp: new Date(),
            //     d_t: undefined,
            //     a_i1: acceleration,
            //     p_1: position,
            //     p_2: undefined,
            //     v_o: undefined,
            //     v_i: undefined
            // };
            //
            // try {
            //     vehicle.setSpeed(optimalSpeed, acceleration);
            // } catch (error) {
            //     logger.error("Cannot set speed [speed=" + optimalSpeed + ", acceleration=" + acceleration + "].", error);
            // }
            //
            //
            // if (isNullOrUndefined(previousCommand)) {
            //     this._previousCommand = command;
            // } else if (!this.handleMissingPoints(
            //         this.keyToPoint(previousCommand.p_1),
            //         this.keyToPoint(position)
            //     )) {
            //     previousCommand.d_t = (new Date().getMilliseconds() - previousCommand.timestamp.getMilliseconds());
            //     previousCommand.p_2 = position;
            //     previousCommand.v_o = optimalSpeed;
            //     previousCommand.v_i = message.speed;
            //
            //     if (Math.abs(previousCommand.v_o - previousCommand.v_i) > 25)
            //         if ((previousCommand.v_o - previousCommand.v_i) > 0)
            //             this._accelerations[previousCommand.p_1] += 25;
            //         else if (this._accelerations[previousCommand.p_1] - 25 >= 0)
            //             this._accelerations[previousCommand.p_1] -= 25;
            //
            //     this.saveCommand(previousCommand);
            //     this._previousCommand = command;
            // } else {
            //     this._previousCommand = command;
            // }
        }
    }

    private keyToPoint(key: string): [number, number] {
        return [
            parseInt(key.split(":")[0]),
            parseInt(key.split(":")[1])
        ];
    }

    private handleMissingPoints(p1: [number, number], p2: [number, number]): boolean {
        let key1: string,
            key2: string,
            track = this._track,
            me = this,
            missing = false,
            logger = this._logger;


        track.eachTransition((t1, t2) => {
            if (t2 !== p2) {
                key1 = t1[0] + ":" + t1[1];
                key2 = t2[0] + ":" + t2[1];
                missing = true;
                if (me._accelerations[key1] - 25 >= 0) {
                    me._accelerations[key1] -= 25;
                    logger.info("acceleration [" + key1 + "] =" + me._accelerations[key1]);
                }

                // if (me._optimalSpeeds[key2] - 25 >= 500) {
                //     me._optimalSpeeds[key2] -= 25;
                //     logger.info("optimalSpeed [" + key2 + "] =" + me._optimalSpeeds[key2]);
                // }
            }
        }, 15, p1, p2);

        return missing;
    }

    private saveCommand(command: Command): void {
        let logger = this._logger;

        MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
            if (!isNullOrUndefined(error))
                logger.error("Cannot connect [mongodb://localhost:27017/anki]", error);

            let collection = db.collection("acceleration-commands");

            collection.insertOne(command)
                .catch(error => logger.error("Cannot insert [" + command + "].", error));
        });
    }

    interrupt(): Promise<void> {
        let vehicle = this._vehicle;

        this._running = false;
        this._initialized = false;

        return new Promise<void>((resolve, reject) => {
            try {
                vehicle.setSpeed(0, 1500);
                setTimeout(() => {

                    resolve();
                }, 1000);
            } catch (e) {
                reject(e);
            }
        });
    }

    isRunning(): boolean {
        return this._running;
    }

}

export {ProfitScenario};
