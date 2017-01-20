import {Piece} from "./piece-interface";
interface Track {

    start : Piece;
    end: Piece;

    eachPiece(handler: (piece : Piece) => any) : void;

}

export {Track};