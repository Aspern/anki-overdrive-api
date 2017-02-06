import {Piece} from "./piece-interface";
interface Track {

    start: Piece;
    end: Piece;

    findPieces(id: number) : Array<Piece>

    findPiece(id: number) : Piece;

    eachPiece(handler: (piece: Piece) => any): void;

    eachLaneOnPiece(handler: (piece: Piece, lane: Array<number>) => any): void;

    findLane(pieceId: number, location: number): number;
}

export {Track};