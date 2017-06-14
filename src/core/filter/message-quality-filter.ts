import {ActiveFilter} from "./active-filter";
import {PositionUpdateMessage} from "../message/v2c/position-update-message";
import {Vehicle} from "../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {Track} from "../../main/de.msg.iot.anki/core/track/track-interface";

class MessageQualityFilter implements ActiveFilter<[Track, Array<Vehicle>], PositionUpdateMessage> {


    init(input: [Track, Array<Vehicle>]): void {
    }

    start(): Promise<void> {
        return null;
    }

    stop(): Promise<void> {
        return null;
    }

    onUpdate(listener: (output: PositionUpdateMessage) => any): void {
    }
}

export {MessageQualityFilter}