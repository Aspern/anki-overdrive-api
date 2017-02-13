/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {Vehicle} from "../vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../message/position-update-message";
import {Track} from "../track/track-interface";
import {Piece} from "../track/piece-interface";


class DistanceFilter {

    private _vehicles: Array<Vehicle> = [];
    private _messages: {[key: string]: PositionUpdateMessage} = {};
    private _handler: (msg: PositionUpdateMessage) => any;
    private _track: Track;
    private _map: {[key: string]: number};

    constructor(track: Track) {
        this._track = track;

        this._map = jsonfile.readFileSync('./resources/distances.json');
    }

    onUpdate(handler: (data: PositionUpdateMessage) => any): void {
        this._handler = handler;
    }

    addVehicle(vehicle: Vehicle): void {
        let me = this,
            lane: number,
            position: number;

        vehicle.addListener((msg: PositionUpdateMessage) => {
            try {
                lane = me._track.findLane(msg.piece, msg.location);
                position = me._track.findPiece(msg.piece).getLocationIndex(lane, msg.location);
                msg.position = position;
            } catch (e) {
                console.error(e);
            }

            me._messages[msg.vehicleId] = msg;
            msg.distances = this.calculateDistances(msg);
            me._handler(msg);
        }, PositionUpdateMessage);

        this._vehicles.push(vehicle);
    }

    removeVehcile(vehicle: Vehicle): void {
        this._vehicles.splice(
            this._vehicles.indexOf(vehicle)
        );
    }

    private calculateDistances(msg: PositionUpdateMessage): Array<{vehicle: string, distance: number}> {
        let distances: Array<{vehicle: string, distance: number}> = [],
            messages = this._messages,
            message: PositionUpdateMessage;

        for (let key in messages) {
            if (messages.hasOwnProperty(key)) {
                if (key !== msg.vehicleId) {
                    message = messages[key];
                    if (this.onSameLane(msg, message)) {
                        try {
                            distances.push(this.calculateDistance(msg, message))
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        }

        return distances;
    }

    private onSameLane(m1: PositionUpdateMessage, m2: PositionUpdateMessage): boolean {
        return Math.abs(m1.offset - m2.offset) <= 34;
    }

    private calculateDistance(m1: PositionUpdateMessage, m2: PositionUpdateMessage): {vehicle: string, distance: number} {
        let me = this,
            track = me._track,
            distance: number = 0,
            laneNumber1: number = track.findLane(m1.piece, m1.location),
            laneNumber2: number = track.findLane(m2.piece, m2.location),
            piece2 = track.findPiece(m2.piece),
            index2 = piece2.getLocationIndex(laneNumber2, m2.location),
            end: [number, number],
            lane2 = piece2.getLane(laneNumber1);
        // t_current: number,
        // t_message: number;

        if (lane2.length > index2) {
            end = [piece2.id, lane2[index2]];
        } else {
            end = [piece2.id, lane2[lane2.length - 1]];
        }

        track.eachTransition((t1, t2) => {
            distance += me.getDistance(t1, t2);
        }, laneNumber1, [m1.piece, m1.location], end);

        // t_current = new Date().getTime();
        // t_message = m1.timestamp.getTime();
        // distance -= m1.speed * ((t_current - t_message) / 100);
        //
        // t_message = m2.timestamp.getTime();
        // distance += m2.speed * ((t_current - t_message) / 100);


        return {
            vehicle: m2.vehicleId,
            distance: distance
        };
    }

    private getDistance(t1: [number, number], t2: [number, number]): number {
        let key: string = "" + t1[0] + t1[1] + t2[0] + t2[1];

        return this._map[key];
    }
}

export {DistanceFilter}