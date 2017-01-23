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


    distance(p1: number, l1: number, p2: number, l2: number): number {
        let piece1 = this.findPiece(p1),
            pos1: number,
            pos2 : number,
            piece2 = this.findPiece(p2),
            lane1 = 0,
            lane2= 0,
            distance = 0;

        if(!piece1 || !piece2)
            throw new Error("Invalid pieces");

        for (; lane1 < 16; lane1++) {
            if (piece1.getLane(lane1).indexOf(l1) > -1) {
                pos1 =  piece1.getLane(lane1).length - piece1.getLane(lane1).indexOf(l1);
                break;
            }
        }

        for(;lane2 < 16; lane2++) {
            if (piece2.getLane(lane2).indexOf(l2) > -1) {
                pos2 = piece2.getLane(lane2).length - piece2.getLane(lane2).indexOf(l2);
                break;
            }
        }

        let next = piece1.next;

        while(next !== piece2) {
            distance += next.getLane(lane1).length;
            next = next.next;
        }


        distance += pos1 + pos2;

        return distance;
    }

    get start(): StartPiece {
        return this._start;
    }

    get end(): EndPiece {
        return this._end;
    }
}

export {AnkiOverdriveTrack};