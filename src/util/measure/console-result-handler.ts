import {ResultHandler} from "./result-handler-interface";
import {PositionUpdateMessage} from "../../core/message/position-update-message";

class ConsoleResultHandler implements ResultHandler<Array<Array<PositionUpdateMessage>>> {

    handleResult(result: Array<Array<PositionUpdateMessage>>): void {
        let i = 0;
        result.forEach((lane) => {
            console.log("Results for lane " + ++i);
            for (var j = 0; j < lane.length - 1; ++j) {
                let m1 = lane[j],
                    m2 = lane[j + 1],
                    out = "";

                out += m1.piece + "@" + m1.location;
                out += " => " + m2.piece + "@" + m2.location + "\t";
                out += "distance = " + ((m1.speed + m2.speed) / 2) * ((m2.timestamp.getTime() - m1.timestamp.getTime()) / 1000) + "mm";
                console.log(out);
            }
            console.log("");
        });
    }
}

export {ConsoleResultHandler};