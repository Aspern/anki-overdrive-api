import {ITrack} from "./ITrack";
import {IPiece} from "./IPiece";
import {IVehicle} from "../";
import {IVehicleMessage} from "../message/IVehicleMessage";
import {LocalizationPositionUpdate} from "../message/v2c/LocalizationPositionUpdate";
import {LocalizationTransitionUpdate} from "../message/v2c/LocalizationTransitionUpdate";
import {Start} from "./Start";
import {Finish} from "./Finish";
import {Straight} from "./Straight";
import {Curve} from "./Curve";
import {TrackScanner} from "./TrackScanner";

class Track implements ITrack {

    private _start: Start;
    private _finish: Finish;

    constructor(pieces: IPiece[]) {
        this._start = new Start()
        this._finish = new Finish()
        let current: IPiece = this._start

        pieces.forEach(piece => {
            current.next = piece
            piece.previous = current
            current = piece
        })

        current.next = this._finish
        this._finish.next = this._start
    }

    public forEach(handler: (piece: IPiece) => any): void {
        let current: IPiece = this._start

        do {
            handler(current)
            current = current.next
        } while(current !== this._start)
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