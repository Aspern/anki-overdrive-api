import {Piece} from "./piece-interface";
interface Track {

    start: Piece;
    end: Piece;

    findPieces(id: number) : Array<Piece>

    findPiece(id: number) : Piece;

    eachPiece(handler: (piece: Piece) => any): void;

    eachLaneOnPiece(handler: (piece: Piece, lane: Array<number>) => any): void;

    distance(p1: number, l1: number, p2:number, l2: number) : number

}

export {Track};