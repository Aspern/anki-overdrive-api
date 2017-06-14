import {Track} from "./track-interface";
import {Piece} from "./piece-interface";
import {Start} from "./start";
import {Finish} from "./finish";

class TrackImpl implements Track {

    private _start: Start;
    private _finish: Finish;

    constructor() {
        this._start = new Start();
        this._finish = new Finish();

        this.start.previous = this._finish;
        this.finish.next = this.start;
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

        if (piece === null || !piece)
            throw new Error("Piece not found!");

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


    eachTransition(handler: (t1: [number, number], t2: [number, number]) => any, lane: number, from?: [number, number], to?: [number, number]): void {
        let start: [number, number] = [this.start.id, this.start.getLane(lane)[0]],
            end: [number, number] = [this.finish.id, this.finish.getLane(lane)[1]];

        if (from) {
            start = from;
        }

        if (to) {
            end = to;
        }

        if (start[0] === end[0] && start[1] === end[1])
            return;

        let startPiece = this.findPiece(start[0]),
            endPiece = this.findPiece(end[0]),
            current = startPiece,
            currentLane: Array<number> = startPiece.getLane(lane),
            currentLocation: number,
            nextLocation: number,
            currentPieceId: number = startPiece.id,
            startIndex = startPiece.getLocationIndex(lane, start[1]),
            endIndex = endPiece.getLocationIndex(lane, end[1]);

        for (let i = startIndex; i < currentLane.length - 1; ++i) {
            currentLocation = currentLane[i];
            nextLocation = currentLane[i + 1];
            handler([currentPieceId, currentLocation], [currentPieceId, nextLocation]);
        }

        if (!nextLocation) {
            nextLocation = start[1];
        }

        if (current !== endPiece) {
            current = current.next;
            handler([currentPieceId, nextLocation], [current.id, current.getLane(lane)[0]]);
        }


        while (current !== endPiece) {
            currentLane = current.getLane(lane);
            currentPieceId = current.id;
            nextLocation = currentLane[0];
            for (let i = 0; i < currentLane.length - 1; ++i) {
                currentLocation = currentLane[i];
                nextLocation = currentLane[i + 1];
                handler([currentPieceId, currentLocation], [currentPieceId, nextLocation]);
            }
            current = current.next;
            handler([currentPieceId, nextLocation], [current.id, current.getLane(lane)[0]]);
        }

        currentLane = endPiece.getLane(lane);
        currentPieceId = endPiece.id;

        if (startPiece !== endPiece)
            for (let i = 0; i < endIndex; ++i) {
                currentLocation = currentLane[i];
                nextLocation = currentLane[i + 1];
                handler([currentPieceId, currentLocation], [currentPieceId, nextLocation]);
            }

        if (!from || !start)
            handler([currentPieceId, nextLocation], [startPiece.id, startPiece.getLane(lane)[0]]);

    }

    public static build(pieces: Array<Piece>): Track {
        let track = new TrackImpl(),
            current: Piece = track.start,
            last = pieces[pieces.length - 1];

        pieces.forEach((piece) => {
            current.next = piece;
            piece.previous = current;
            current = piece;
        });

        track.finish.previous = last;
        last.next = track.finish;

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

    get start(): Start {
        return this._start;
    }

    get finish(): Finish {
        return this._finish;
    }
}

export {TrackImpl};