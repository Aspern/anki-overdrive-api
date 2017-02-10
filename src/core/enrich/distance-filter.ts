import {Filter} from "./active-filter";
import {Vehicle} from "../vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../message/position-update-message";
import {Track} from "../track/track-interface";
import {Piece} from "../track/piece-interface";
class DistanceFilter implements Filter<PositionUpdateMessage> {

    private _vehicles: Array<Vehicle> = [];
    private _messages: {[key: string]: PositionUpdateMessage} = {};
    private _running: boolean = false;
    private _handler: (msg: PositionUpdateMessage) => any;
    private _track: Track;

    constructor(track: Track) {
        this._track = track;
    }

    start(): Promise<void> {
        let me = this;
        return new Promise<void>(resolve => {
            me._running = true;
            resolve();
        });
    }

    stop(): Promise<void> {
        let me = this;
        return new Promise<void>(resolve => {
            me._running = false;
            me._messages = {};

            while (this._vehicles.length > 0) {
                this._vehicles.pop()
                    .removeListener(this.onPositionUpdate);
            }

            resolve();
        });
    }

    onUpdate(handler: (data: PositionUpdateMessage) => any): void {
        this._handler = handler;
    }

    addVehicle(vehicle: Vehicle): void {
        vehicle.addListener(this.onPositionUpdate, PositionUpdateMessage);
        this._vehicles.push(vehicle);
    }

    removeVehcile(vehicle: Vehicle): void {
        vehicle.removeListener(this.onPositionUpdate);
        this._vehicles.splice(
            this._vehicles.indexOf(vehicle)
        );
    }

    private onPositionUpdate(msg: PositionUpdateMessage): void {
        this._messages[msg.vehicleId] = msg;

        msg.distances = this.calculateDistances(msg);
        this._handler(msg);
    }

    private calculateDistances(msg: PositionUpdateMessage): Array<{vehicle: string, distance: number}> {
        let distances: Array<{vehicle: string, distance: number}> = [],
            messages = this._messages,
            message: PositionUpdateMessage;

        for (let key in messages) {
            if (messages.hasOwnProperty(key)) {
                if (key !== msg.vehicleId) {
                    message = messages[key];
                    if (this.onSameLane(msg, message))
                        this.calculateDistance(msg, message)
                            .then(distances.push)
                            .catch(console.error);
                }
            }
        }

        return distances;
    }

    private onSameLane(m1: PositionUpdateMessage, m2: PositionUpdateMessage): boolean {
        return Math.abs(m1.offset - m2.offset) <= 34;
    }

    private calculateDistance(m1: PositionUpdateMessage, m2: PositionUpdateMessage): Promise<{vehicle: string, distance: number}> {
        let me = this,
            track = me._track,
            p1: Piece,
            p2: Piece,
            current: Piece,
            distance = 0,
            l1: number,
            l2: number;

        return new Promise((resolve, reject) => {
            try {
                p1 = track.findPiece(m1.piece);
                p2 = track.findPiece(m2.piece);
                l1 = track.findLane(m1.piece, m1.location);
                l2 = track.findLane(m2.piece, m2.location);
                current = p1;

                distance += p1.getLocationIndex(l1, m1.location);
                while (current.next !== p2) {
                    current = current.next;
                    distance += current.getLane(l1).length;
                }
                distance += p1.getLocationIndex(l2, m2.location);

                resolve({
                    vehicle: m2.vehicleId,
                    distance: distance
                });

            } catch (e) {
                reject(e);
            }
        });

    }
}