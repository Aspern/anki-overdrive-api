import {IPiece} from "../track/IPiece";
import {Start} from "./Start";
import {Finish} from "./Finish";

interface ITrack {

    start: Start
    finish: Finish

    forEach(handler: (piece: IPiece) => any): void

}

export {ITrack}