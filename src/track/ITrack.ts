import {IPiece} from "../track/IPiece";
import {Start} from "./Start";
import {Finish} from "./Finish";

interface ITrack {

    start: Start
    finish: Finish

    distance([p1, l1]: [number, number], [p2, l2]: [number, number]): number

    forEach(handler: (piece: IPiece) => any): void

    getPiece(pieceId: number): IPiece|undefined

}

export {ITrack}
