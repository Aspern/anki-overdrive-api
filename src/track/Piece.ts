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

    public distance(locationId1: number, locationId2: number): number {
        return Math.abs(
            this.getIndexByLocationId(locationId1)
            - this.getIndexByLocationId(locationId2)
        )
    }

    public getFirstLocationId(index: number): number {
        if(!this._locations[index]) {
            throw new Error(`Index [${index}] is out of bound.`)
        }
        return this._locations[index][0]
    }

    public getLastLocationId(index: number): number {
        return this._locations[index][this._locations[index].length - 1]
    }

    get reversed(): boolean {
        return this._reversed
    }

    public getIndexByLocationId(locationId: number): number {
        for(let i = 0; i < this._locations.length; i++) {
            const index = this.locations[i].indexOf(locationId)
            if(index >= 0) { return index } 1
        }
        throw new Error(`Location with id [${locationId}] does not exist.`)
    }

}

export {Piece}
