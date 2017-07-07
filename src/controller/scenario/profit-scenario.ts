/// <reference path="../../../decl/jsonfile.d.ts"/>
import {Scenario} from "./scenario-interface";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import * as files from "jsonfile";
import {Track} from "../../core/track/track-interface";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import {isNullOrUndefined} from "util";
import {Collection, Db, MongoClient} from "mongodb";
import * as log4js from "log4js";
import {KafkaController} from "../kafka/kafka-controller";
import Timer = NodeJS.Timer;
type Point = [number, number];

const uuidv4 = require('uuid/v4');

type LinearFunction = (vi_1: number) => any;
type Models = { [key: string]: LinearFunction };

interface Command {
    timestamp: Date;
    p1: string;
    p2: string;
    ai_1: number;
    vi: number;
    vi_1: number;
    v0: number;
    score: number;
    setupId: string,
    messageName: string
}

class ProfitScenario implements Scenario {

    private _running = false;
    private _vehicle: Vehicle;
    private _accelerations: { [key: string]: number } = {};
    private _optimalSpeeds: { [key: string]: number } = {};
    private _models: Models = {};
    private _distances: { [key: string]: number } = {};
    private _track: Track;
    private _initialized = false;
    private _previousCommand: Command;
    private _logger: log4js.Logger;
    private _kafka: KafkaController;
    private _improve = false;
    private _task: Timer;

    constructor(vehicle: Vehicle, track: Track) {
        this._logger = log4js.getLogger("profit-scenario");
        this._vehicle = vehicle;
        this._track = track;
        this._optimalSpeeds = files.readFileSync("resources/optimal-speeds.json");
        this._kafka = new KafkaController();
        this.loadDistances();
    }


    start(): Promise<void> {
        let vehicle = this._vehicle,
            me = this,
            logger = this._logger;

        this._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                vehicle.setSpeed(851, 600);

                me.startBatchViewTask();

                me._kafka.initializeProducer().then(online => {
                    if (!online) {
                        logger.error("Kafka server is offline, scenario is not initialized.");
                    } else {
                        me._initialized = true;
                        logger.info("Initialized Profit-scenario.");
                        resolve();
                    }
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    }


    onUpdate(message: VehicleMessage): void {
        if (this._improve && this._initialized && message instanceof PositionUpdateMessage) {
            let key = message.piece + ":" + message.location,
                acceleration: number,
                optimalSpeed: number,
                vehicle = this._vehicle,
                logger = this._logger,
                offset = message.offset,
                command: Command,
                previousCommand = this._previousCommand,
                me = this,
                missingPoints = false;

            if (message.offset < 59.5) {
                logger.warn("vehicle is not on lane [offset=" + offset + ", position=" + key + "].");
                vehicle.setOffset(offset);
                vehicle.changeLane(68.0);
                return;
            }

            if (!this._optimalSpeeds.hasOwnProperty(key)) {
                logger.error("Found no optimal speed for [position=" + key + "].");
                return;
            }

            if (!this._accelerations.hasOwnProperty(key)) {
                this._accelerations[key] = 250;
            }

            optimalSpeed = this._optimalSpeeds[key];
            acceleration = this._accelerations[key];

            command = {
                vi_1: message.speed,
                score: undefined,
                timestamp: new Date(),
                ai_1: acceleration,
                p2: undefined,
                p1: key,
                v0: optimalSpeed,
                vi: undefined,
                setupId: message.setupId,
                messageName: "accelCommand"
            }

            try {
                vehicle.setSpeed(optimalSpeed, acceleration);
            } catch (error) {
                logger.error("Cannot set-speed [speed=" + optimalSpeed + ", acceleration=" + acceleration + "].", error);
            }

            if (isNullOrUndefined(previousCommand)) {
                this._previousCommand = command;
            } else {

                previousCommand.p2 = key;
                previousCommand.vi = message.speed;
                previousCommand.score = this.scoreFunction(previousCommand);


                missingPoints = this.handleMissingPoints(
                    this.keyToPoint(previousCommand.p1),
                    this.keyToPoint(previousCommand.p2),
                    (k1, k2) => {
                        me._accelerations[k1] = me.estimateAcceleration({
                            p2: k2,
                            score: undefined,
                            vi: me._optimalSpeeds[k2],
                            v0: me._optimalSpeeds[k2],
                            ai_1: undefined,
                            timestamp: undefined,
                            vi_1: previousCommand.vi_1,
                            p1: k1,
                            setupId: undefined,
                            messageName: undefined
                        });
                    }
                );


                if (!missingPoints) {

                    let key = previousCommand.p1;

                    if (this._models.hasOwnProperty(key)) {
                        this._accelerations[key] = this._models[key](previousCommand.vi_1);
                    } else {
                        this._accelerations[key] = this.estimateAcceleration(previousCommand);
                    }

                    this.saveCommand(previousCommand);
                }

                this._previousCommand = command;

            }

        }
    }


    interrupt(): Promise<void> {
        let vehicle = this._vehicle,
            me = this;

        this._running = false;
        this._initialized = false;

        return new Promise<void>((resolve, reject) => {
            try {
                vehicle.setSpeed(0, 1500);
                clearInterval(me._task);
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


    set improve(value: boolean) {
        this._improve = value;
    }

    private scoreFunction(command: Command): number {
        return ((Math.abs(command.v0 - command.vi)) / command.v0);
    }

    private estimateAcceleration(command: Command): number {
        let s = this.getDistanceBetween(
            command.p1,
            command.p2),
            v0 = command.v0,
            vi_1 = command.vi_1,
            vi = command.vi,
            acceleration = Math.round(((v0 - vi_1) * (vi_1 + vi)) / (2 * s));

        if (acceleration < 0)
            acceleration *= -1;

        return acceleration;
    }

    private keyToPoint(key: string): Point {
        return [
            parseInt(key.split(":")[0]),
            parseInt(key.split(":")[1])
        ];
    }

    private pointToKey(point: Point) {
        return (point[0] + ":" + point[1]);
    }

    private handleMissingPoints(p1: Point, p2: Point, handler: (k1: string, k2: string) => any): boolean {
        let track = this._track,
            me = this,
            missing = false;

        track.eachTransition((t1, t2) => {
            if (t2[0] !== p2[0] && t2[1] !== p2[1]) {
                handler(me.pointToKey(t1), me.pointToKey(t2));
                missing = true;
            }
        }, 15, p1, p2);

        return missing;
    }

    private saveCommand(command: Command): void {
        let logger = this._logger;

        this._kafka.sendPayload([{
            topic: "vehicle-data",
            key: uuidv4(),
            partitions: 1,
            messages: JSON.stringify(command)
        }]).catch(error => logger.error("Cannot send message via Kafka", error));

        // this.connectMongoDb().then(db => {
        //
        //     db.collection("acceleration-commands")
        //         .insertOne(command)
        //         .catch(error => {
        //             logger.error("Cannot insert command " + JSON.stringify(command) + ".", error);
        //         });
        //
        // }).catch(error => {
        //     logger.info("Cannot connect to MongoDB to save command.", error);
        // });
    }

    private getDistanceBetween(k1: string, k2: string) {
        return this.getDistanceBetweenPoints(
            this.keyToPoint(k1),
            this.keyToPoint(k2)
        );
    }

    private getDistanceBetweenPoints(p1: Point, p2: Point) {
        let key = "" + p1[0] + p1[1] + p2[0] + p2[1];

        return this._distances[key];
    }

    private loadDistances(): void {
        let logger = this._logger,
            me = this,
            collection: Collection;

        this.connectMongoDb().then(db => {

            collection = db.collection("distances");
            collection.find({})
                .toArray((error, documents) => {
                    if (!isNullOrUndefined(error))
                        logger.error("Unable to find distances.", error);

                    documents.forEach(document => {
                        me._distances[document.key] = document.avg;
                    });
                });

        }).catch(error => {
            logger.info("Cannot connect to MongoDB to load distances.", error);
        });
    }

    private connectMongoDb(): Promise<Db> {
        return new Promise<Db>((resolve, reject) => {
            MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
                if (!isNullOrUndefined(error)) {
                    reject(error);
                } else {
                    resolve(db);
                }
            });
        });
    }

    private startBatchViewTask(): void {
        let me = this,
            logger = this._logger,
            models = this._models;

        this._task = setInterval(() => {
            me.connectMongoDb().then(db => {

                let collection = db.collection("acceleration-model");

                collection.find({})
                    .toArray((error, documents) => {
                        if (!isNullOrUndefined(error)) {
                            logger.error("Error while searching models.", error);
                        } else {
                            logger.info("Found models:")
                            documents.forEach(doc => {
                                logger.info(doc.position + ": f(x) = " + doc.slope + "x + " + doc.intercept);
                            });

                            documents.forEach(document => {
                                //if (document.correlation > 0.85)
                                models[document.position] = (v1_1: number) => {
                                    return Math.round(document.slope * v1_1 + document.intercept);
                                };
                            });
                        }
                    });


            }).catch(error => logger.info("Cannot connect to MongoDB to load models.", error));
        }, 60000)
    }

}

export {ProfitScenario};
