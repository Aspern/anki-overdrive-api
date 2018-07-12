import {IPiece} from "./IPiece";

abstract class Piece implements IPiece {

    protected _id: number;
    protected _next: IPiece;
    protected _previous: IPiece;
    protected _locations: number[][]
    protected _reversed: boolean

    protected constructor(id: number, locations: number[][]) {
        this._id = id
        this._locations = locations
        this._reversed = false
    }

    public reverse(): void {
        this._locations.reverse()
        this._locations.forEach(line => line.reverse())
        this._reversed = !this._reversed
    }

    get locations(): number[][] {
        return this._locations
    }

    get id(): number {
        return this._id
    }

    get next(): IPiece {
        return this._next
    }

    set next(piece: IPiece) {
        this._next = piece
    }

    get previous(): IPiece {
        return this._previous
    }

    set previous(piece: IPiece) {
        this._previous = piece
    }

    get reversed(): boolean {
        return this._reversed
    }

}

export {Piece}