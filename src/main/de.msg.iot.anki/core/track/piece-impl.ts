import {Piece} from "./piece-interface";

abstract class PieceImpl implements Piece {

    protected _id: number;
    private _next: Piece;
    private _previous: Piece;
    protected _lanes: Array<Array<number>>;

    protected constructor(id: number) {
        this._id = id;
        this._lanes = this.initLocations();
    }

    getLane(lane: number): Array<number> {
        return this._lanes[lane];
    }

    getLocation(lane: number, position: number): number {
        return this._lanes[lane][position];
    }

    getLocationIndex(lane: number, location: number): number {
        return this._lanes[lane].indexOf(location);
    }

    eachLane(handler: (lane: Array<number>) => any): void {
        this._lanes.forEach((lane) => {
            handler(lane);
        });
    }

    eachLocation(handler: (location: number) => any): void {
        this.eachLane((lane) => {
            lane.forEach((location) => {
                handler(location);
            });
        });
    }

    eachLocationOnLane(lane: number, handler: (location: number) => any): void {
        this.getLane(lane).forEach((location) => {
            handler(location);
        });
    }

    abstract initLocations(): Array<Array<number>>;

    get id(): number {
        return this._id;
    }

    get next(): Piece {
        return this._next;
    }

    get previous(): Piece {
        return this._previous;
    }

    set next(value: Piece) {
        this._next = value;
    }

    set previous(value: Piece) {
        this._previous = value;
    }
}

export {PieceImpl}