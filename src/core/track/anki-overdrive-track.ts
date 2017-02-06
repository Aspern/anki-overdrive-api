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


    findPieces(id: number): Array<Piece> {
        let pieces: Array<Piece> = [];

        this.eachPiece((piece) => {
            if (piece.id === id)
                pieces.push(piece);
        });

        return pieces;
    }

    findPiece(id: number): Piece {
        let pieces = this.findPieces(id),
            piece = null;

        if (pieces.length > 0)
            piece = pieces[0];

        return piece;
    }

    eachPiece(handler: (piece: Piece) => any): void {
        let current: Piece = this.start;

        do {
            handler(current);
            current = current.next;
        } while (current !== this.start);
    }


    eachLaneOnPiece(handler: (piece: Piece, lane: Array<number>) => any): void {
        for (let i = 0; i < 16; ++i) {
            this.eachPiece((piece) => {
                handler(piece, piece.getLane(i));
            });
        }
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

    findLane(pieceId: number, location: number): number {
        let lane = 0,
            piece = this.findPiece(pieceId);

        for (; lane < 16; ++lane)
            if (piece.getLane(lane).indexOf(location) > -1)
                return lane;

        throw new Error("Found no lane for piece [" + pieceId + "] and location [" + location + "].");
    }

    get start(): StartPiece {
        return this._start;
    }

    get end(): EndPiece {
        return this._end;
    }
}

export {AnkiOverdriveTrack};