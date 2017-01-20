import {Track} from "./track-interface";
import {Piece} from "./piece-interface";
import {StartPiece} from "./start-piece";
import {EndPiece} from "./end-piece";

class AnkiOverdriveTrack implements Track {

    private _start: StartPiece;
    private _end: EndPiece;

    constructor() {
        this._start = new StartPiece();
        this._end = new EndPiece();

        this.start.previous = this._end;
        this.end.next = this.start;
    }

    eachPiece(handler: (piece: Piece) => any): void {
        let current: Piece = this.start;

        do {
            handler(current);
            current = current.next;
        } while (current !== this.start);
    }

    public static build(pieces: Array<Piece>): Track {
        let track = new AnkiOverdriveTrack(),
            current: Piece = track.start,
            last = pieces[pieces.length - 1];

        pieces.forEach((piece) => {
            current.next = piece;
            piece.previous = current;
            current = piece;
        });

        track.end.previous = last;
        last.next = track.end;

        return track;
    }


    get start(): StartPiece {
        return this._start;
    }

    get end(): EndPiece {
        return this._end;
    }
}

export {AnkiOverdriveTrack};