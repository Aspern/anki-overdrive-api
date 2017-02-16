import {ActiveFilter} from "./active-filter";
import {Vehicle} from "../vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../message/position-update-message";
import {Track} from "../track/track-interface";
import {Distance} from "./distance";

/**
 * The AbstractDistanceFilter uses a track and a set of vehicles  that travel on the track to
 * calculate the distance between them. The distance is calculated in an abstract manner and must
 * be specified in a successor implementation. In the same way, errors that occur are treated only
 * abstractly.
 *
 * The Filter enriches the PositionUpdateMessage of the vehicles by adding following information
 * from the track.
 *
 * <ul>
 *  <li>The lane on which the vehicle is driving on.</li>
 *  <li>The vertical position of the message.</<li>
 *  <li>The vertical and horizontal distance to each other vehicle on the track.</li>
 * </ul>
 */
abstract class AbstractDistanceFilter implements ActiveFilter<[Track, Array<Vehicle>], PositionUpdateMessage> {

    protected _track: Track;

    private _vehicles: Array<Vehicle>;
    private _store: {[key: string]: PositionUpdateMessage} = {};
    private _listener: (output: PositionUpdateMessage) => any = () => {
    };
    private _started = false;
    private _listenerInstances: {[key: string]: (message: PositionUpdateMessage) => any} = {};

    init(input: [Track, Array<Vehicle>]): void {
        this._track = input[0];
        this._vehicles = input[1];
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>(resolve => {
            me._started = true;
            me.registerVehicleListeners();
            resolve();
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>(resolve => {
            me._started = false;
            me.unregisterVehicleListeners();
            resolve();
        });
    }

    onUpdate(listener: (output: PositionUpdateMessage) => any): void {
        if (!this._started)
            this._listener = listener;
    }

    private registerVehicleListeners(): void {
        let me = this,
            uuid: string;

        me._vehicles.forEach(vehicle => {
            uuid = vehicle.id;

            me._listenerInstances[uuid] = (message: PositionUpdateMessage) => {
                me._store[uuid] = message;
                me.enrich(message);
                me._listener(message);
            };

            vehicle.addListener(me._listenerInstances[uuid], PositionUpdateMessage);
        });
    }

    private unregisterVehicleListeners(): void {
        let me = this,
            uuid: string;

        me._vehicles.forEach(vehicle => {
            uuid = vehicle.id;

            vehicle.removeListener(me._listenerInstances[uuid]);
        });
    }

    private enrich(message: PositionUpdateMessage): void {
        let me = this;

        try {
            message.lane = me._track.findLane(message.piece, message.location);
            message.position = me._track
                .findPiece(message.piece)
                .getLocationIndex(message.lane, message.location);
            message.distances = me.findDistances(message);
        } catch (e) {
            me.handleError(e);
        }
    }

    private findDistances(message: PositionUpdateMessage): Array<Distance> {
        let me = this,
            uuid = message.vehicleId,
            record: PositionUpdateMessage,
            key: string,
            distances: Array<Distance> = [];

        for (key in me._store) {
            if (me._store.hasOwnProperty(key)) {
                if (key !== uuid) {
                    record = me._store[key];
                    distances.push(me.distanceBetween(message, record));
                }
            }
        }

        return distances;
    }

    private distanceBetween(m1: PositionUpdateMessage, m2: PositionUpdateMessage): Distance {
        let me = this,
            distance = new Distance();

        // Distance from (m1) to (m2).
        distance.vehicle = m2.vehicleId;
        distance.vertical = me.verticalDistance(m1, m2);
        distance.horizontal = me.horizontalDistance(m1, m2);

        return distance;
    }

    private verticalDistance(m1: PositionUpdateMessage, m2: PositionUpdateMessage): number {
        return Math.abs(m1.offset - m2.offset);
    }

    private horizontalDistance(m1: PositionUpdateMessage, m2: PositionUpdateMessage): number {
        let me = this,
            distance = 0,
            from: [number, number] = [m1.piece, m1.location],
            to: [number, number] = me.approximateLocationFor(m1, m2),
            currentTimestamp: number = new Date().getTime(),
            lastTimestamp: number = m2.timestamp.getTime();

        // sum all transitions between m1 and m2.
        me._track.eachTransition((l1, l2) => {
            distance += me.getDistanceForTransition(l1, l2);
        }, m1.lane, from, to);

        // distance which m2 has additionally returned after sending the message.
        distance += m2.speed * ((currentTimestamp - lastTimestamp) / 1000);

        return distance;
    }

    private approximateLocationFor(m1: PositionUpdateMessage, m2: PositionUpdateMessage): [number, number] {
        let me = this,
            lane1 = m1.lane,
            lane2 = this._track.findLane(m2.piece, m2.location),
            piece2 = this._track.findPiece(m2.piece),
            position2 = piece2.getLocationIndex(lane2, m2.location),
            locationsLane1 = piece2.getLane(lane1);

        // Try to use same position of location.
        if (locationsLane1.length > position2)
            return [piece2.id, locationsLane1[position2]];

        // If piece is a curve the latest position will be used.
        return [piece2.id, locationsLane1[locationsLane1.length - 1]];
    }


    /**
     * Specifies how an error should be treated during the filter process.
     *
     * @param e Error occurred
     */
    protected abstract handleError(e: Error): void;

    /**
     * Calculates and returns the distance in mm between any transitions on the same lane.
     *
     * @param l1 Location on piece 1
     * @param l2 Location on piece 2
     */
    protected abstract getDistanceForTransition(l1: [number, number], l2: [number, number]): number;

}

export {AbstractDistanceFilter};