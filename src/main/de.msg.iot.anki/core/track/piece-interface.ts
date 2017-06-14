/**
 * A piece is a part of a track. Each piece has two neighbours one next and one behind
 * (previous). Each piece consists of a position matrix whose lines represent the lines on the
 * track. A piece as a not-unique identifier.
 */
interface Piece {

    id: number;
    next: Piece;
    previous: Piece;

    /**
     * Returns the lane as array using the number of the lane.
     *
     * @param lane Lane as number
     * @return lane as array
     */
    getLane(lane: number): Array<number>;

    /**
     * Returns a single location (point) of the position matrix.
     *
     * @param lane Lane (horizontal position)
     * @param position Vertical position
     */
    getLocation(lane: number, position: number): number;

    /**
     * Returns the vertical position (index) of any location.
     *
     * @param lane Lane (horizontal position)
     * @param location Location
     * @return vertical position (index)
     */
    getLocationIndex(lane: number, location: number): number;

    /**
     * Iterates over each lane on the piece.
     *
     * @param handler Handler function
     * @param handler.lane Lane as array
     */
    eachLane(handler: (lane: Array<number>) => any): void;

    /**
     * Iterates over the whole position matrix of the piece.
     *
     * @param handler Handler function
     * @param handler.location Current location
     */
    eachLocation(handler: (location: number) => any): void;

    /**
     * Iterates all locations on a given lane.
     *
     * @param lane Lane
     * @param handler Handler function
     * @param handler.location   Current location
     */
    eachLocationOnLane(lane: number, handler: (location: number) => any): void;


}

export {Piece};