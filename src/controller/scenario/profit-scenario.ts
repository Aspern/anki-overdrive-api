/// <reference path="../../../decl/jsonfile.d.ts"/>
import {Scenario} from "./scenario-interface";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {Vehicle} from "../../core/vehicle/vehicle-interface";
import * as files from "jsonfile";
import {Track} from "../../core/track/track-interface";
import {wrap} from "node-mysql-wrapper";
import {PositionUpdateMessage} from "../../core/message/v2c/position-update-message";
import {isNullOrUndefined} from "util";

class ProfitScenario implements Scenario {

    private _running = false;
    private _vehicle: Vehicle;
    private _distances: { [key: string]: number };
    private _optimalSpeeds: { [key: string]: number } = {};
    private _track: Track;

    constructor(vehicle: Vehicle, track: Track) {
        this._vehicle = vehicle;
        this._distances = files.readFileSync("resources/distances.json");
        this._track = track;


        let mysql = require('mysql'),
            connection = mysql.createConnection({
                host: 'localhost',
                user: 'aweber',
                password: 'anki',
                database: 'anki'
            }),
            db = wrap(connection),
            simpleBarrier = require("simple-barrier"),
            barrier = new simpleBarrier(),
            me = this;

        db.ready(() => {
            db.table("OPTIMALSPEED")
                .findAll()
                .then(records => {
                    records.forEach((record: any) => {
                        me._optimalSpeeds[record.POSITION] = record.SPEED;
                    });
                });
        });
    }


    start(): Promise<void> {
        let vehicle = this._vehicle;

        this._running = true;

        return new Promise<void>((resolve, reject) => {
            try {
                vehicle.setSpeed(600, 600);
                setTimeout(() => {
                    vehicle.changeLane(68);
                }, 3000);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    onUpdate(message: VehicleMessage): void {
        if (message instanceof PositionUpdateMessage) {
            // let position = message.piece + ":" + message.location,
            //     nextPosition = this.getNextPosition(message.piece, message.location),
            //     distance = this.getDistanceToNextPosition(position, nextPosition),
            //     optimalSpeed = this.getOptimalSpeedForNextPosition(nextPosition),
            //     acceleration = Math.abs((Math.pow(optimalSpeed, 2) - Math.pow(message.speed, 2)) / (2 * distance));
            //
            // console.log(optimalSpeed + ", " + acceleration);
            // this._vehicle.setSpeed(optimalSpeed, acceleration);

            let position = message.piece + ":" + message.location,
                vehicle = this._vehicle;

            if (position === "33:15") {
                vehicle.setSpeed(650, 550);
            } else if (position === "23:37") {
                vehicle.setSpeed(1300, 550);
            } else if (position === "36:47") {
                vehicle.setSpeed(650, 550);
            } else if (position === "20:37") {
                vehicle.setSpeed(1300, 550);
            }
        }
    }

    interrupt(): Promise<void> {
        let vehicle = this._vehicle;

        this._running = false;

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

    private getNextPosition(pieceId: number, location: number): string {
        let track = this._track,
            lane = track.findLane(pieceId, location),
            next: string = null;

        track.eachTransition((t1, t2) => {
            if (isNullOrUndefined(next))
                next = t2[0] + ":" + t2[1];
        }, lane, [pieceId, location]);

        return next;
    }

    private getDistanceToNextPosition(position: string, nextPosition: string): number {
        let key = position.replace(":", "") + nextPosition.replace(":", "");
        return this._distances[key];
    }

    private getOptimalSpeedForNextPosition(position: string) {
        return this._optimalSpeeds[position];
    }
}

export {ProfitScenario};
