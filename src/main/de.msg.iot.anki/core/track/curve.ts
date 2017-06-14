import {PieceImpl} from "./piece-impl";

class Curve extends PieceImpl {

    constructor(id: number) {
        super(id);
    }

    initLocations(): Array<Array<number>> {
        return [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
            [8, 9],
            [10, 11],
            [12, 13],
            [14, 15],
            [16, 17],
            [18, 19],
            [20, 21, 22],
            [23, 24, 25],
            [26, 27, 28],
            [29, 30, 31],
            [32, 33, 34],
            [35, 36, 37]
        ];
    }
}

export {Curve};