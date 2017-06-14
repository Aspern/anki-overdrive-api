import {PieceImpl} from "./piece-impl";

class Start extends PieceImpl {

    public static _ID: number = 33;

    constructor() {
        super(Start._ID);
    }

    initLocations(): Array<Array<number>> {
        return [
            [0],
            [1],
            [2],
            [3],
            [4],
            [5],
            [6],
            [7],
            [8],
            [9],
            [10],
            [11],
            [12],
            [13],
            [14],
            [15]
        ];
    }
}

export {Start};