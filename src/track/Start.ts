import {Piece} from "./Piece";

class Start extends Piece {

    public static ID = 33

    constructor() {
        super(Start.ID, [
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
        ])
    }

}

export {Start}