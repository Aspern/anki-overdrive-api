import {ITrack} from "./ITrack";
import {IPiece} from "./IPiece";
import {IVehicle} from "../";
import {Start} from "./Start";
import {Finish} from "./Finish";
import {TrackScanner} from "./TrackScanner";

class Track implements ITrack {

    private readonly _start: Start;
    private readonly _finish: Finish;
    private readonly _pieces: IPiece[]

    constructor(pieces: IPiece[] = []) {
        this._start = new Start()
        this._finish = new Finish()
        this._pieces = [this._start, this._finish, ...pieces]
        let current: IPiece = this._start

        pieces.forEach(piece => {
            current.next = piece
            piece.previous = current
            current = piece
        })

        current.next = this._finish
        this._finish.next = this._start
    }

    public distance([pieceId1, locationId1]: [number, number], [pieceId2, locationId2]: [number, number]): number {
        let current = this.getPiece(pieceId1)
        const target = this.getPiece(pieceId2)
        const index = current.getIndexByLocationId(locationId1)
        let distance = 0

        if(current === target) {
            return current.distance(locationId1, locationId2)
        }

        distance += current.distance(locationId1, current.getLastLocationId(index))
        current = current.next
        ++distance

        while(current !== target) {
            distance += current.distance(
                current.getFirstLocationId(index),
                current.getLastLocationId(index)
            )
            ++distance
            current = current.next
        }

        distance += target.distance(target.getFirstLocationId(index), locationId2)

        return distance
    }

    public forEach(handler: (piece: IPiece) => any): void {
        let current: IPiece = this._start

        do {
            handler(current)
            current = current.next
        } while(current !== this._start)
    }

    public getPiece(pieceId: number): IPiece|undefined {
        return this._pieces
            .filter(p => p.id === pieceId)
            .pop()
    }

    get finish(): Finish {
        return this._finish
    }

    get start(): Start {
        return this._start
    }

    public static scan(vehicle: IVehicle): Promise<ITrack> {
        return new TrackScanner().scan(vehicle)
    }
}

export {Track}
