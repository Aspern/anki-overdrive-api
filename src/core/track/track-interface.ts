import {Piece} from "./piece-interface";

/**
 * A track represents a set of successive pieces. It can find individual pieces or return lines  or
 * entire transitions. Each track consists of at least one Start and one Finish.
 */
interface Track {

    start: Piece;
    finish: Piece;

    /**
     * Returns a set of pieces with the same identifier.
     *
     * @param id Identifier of the pieces
     * @return array with pieces
     */
    findPieces(id: number): Array<Piece>

    /**
     * Returns a single piece by its identifier.
     *
     * @param id Identifier of the piece
     * @return piece
     */
    findPiece(id: number): Piece;

    /**
     * Iterates over each piece.
     *
     * @param handler Handler function
     * @param handler.piece The current piece
     */
    eachPiece(handler: (piece: Piece) => any): void;

    /**
     * Iterates first over each piece and then over each lane on this piece.
     *
     * @param handler Handler function
     * @param handler.piece The current piece
     * @param handler.lane The current lane of the piece
     */
    eachLaneOnPiece(handler: (piece: Piece, lane: Array<number>) => any): void;

    /**
     * Iterates over all transitions on a whole lane or a subset of given transitions.
     *
     * @param handler Handler function
     * @param lane Lane as number
     * @param from (optional) start transition
     * @param to (optional) finish transition
     */
    eachTransition(handler: (t1: [number, number], t2: [number, number]) => any, lane: number, from?: [number, number], to?: [number, number]): void;

    /**
     * Finds and returns the number of the lane corresponding to the piece identifier and any
     * location on the lane.
     *
     * @param pieceId Identifier of the piece
     * @param location Location for the lane
     * @return lane as number
     */
    findLane(pieceId: number, location: number): number;

}

export {Track};