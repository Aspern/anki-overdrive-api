interface Piece {


    id: number;
    next: Piece;
    previous: Piece;

    getLane(lane: number): Array<number>;

    getLocation(lane: number, position: number): number;

    getLocationIndex(lane: number, location: number): number;

    eachLane(handler: (lane: Array<number>) => any): void;

    eachLocation(handler: (location: number) => any): void;

    eachLocationOnLane(lane: number, handler: (location: number) => any): void;


}

export {Piece};