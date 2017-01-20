import {Piece} from "./piece-interface";
interface Track {

    start: Piece;
    end: Piece;

    eachPiece(handler: (piece: Piece) => any): void;

    eachLaneOnPiece(handler: (piece: Piece, lane: Array<number>) => any): void;

}

export {Track};