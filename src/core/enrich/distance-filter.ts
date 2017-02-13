import {Vehicle} from "../vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../message/position-update-message";
import {Track} from "../track/track-interface";
import {Piece} from "../track/piece-interface";

class DistanceFilter {

    private _vehicles: Array<Vehicle> = [];
    private _messages: {[key: string]: PositionUpdateMessage} = {};
    private _handler: (msg: PositionUpdateMessage) => any;
    private _track: Track;

    constructor(track: Track) {
        this._track = track;
    }

    onUpdate(handler: (data: PositionUpdateMessage) => any): void {
        this._handler = handler;
    }

    addVehicle(vehicle: Vehicle): void {
        let me = this;

        vehicle.addListener((msg: PositionUpdateMessage) => {
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
            p1: Piece = track.findPiece(m1.piece),
            p2: Piece = track.findPiece(m2.piece),
            current: Piece = p1,
            distance = 0,
            l1: number = track.findLane(m1.piece, m1.location),
            l2: number = track.findLane(m2.piece, m2.location);

        distance += p1.getLocationIndex(l1, m1.location);
        while (current.next !== p2) {
            current = current.next;
            distance += current.getLane(l1).length;
        }
        distance += p1.getLocationIndex(l2, m2.location);

        return {
            vehicle: m2.vehicleId,
            distance: distance
        };
    }
}

export {DistanceFilter}