import {ResultHandler} from "./result-handler-interface";
import {Distance} from "./distance";

class ConsoleResultHandler implements ResultHandler<Array<[Distance, Array<Distance>]>> {

    handleResult(result: Array<[Distance, Array<Distance>]>): void {

        console.log("Lane \t Whole Lane \t \t \t Transitions");
        console.log("\t avgSpeed[mm/sec] \t duration [sec] \t distance [mm] \t" +
            " avgSpeed[mm/sec] \t duration [sec] \t distance [mm]");

        let
            transitionTables: Array<string> = [],
            j = 0;

        result.forEach((lane) => {
            let distanceLane = lane[0],
                distanceTransitions = lane[1],
                aggregatedTransitions: [number, number, number] = this.aggregateTransistions(distanceTransitions),
                row = "",
                i = 0,
                transitionTable = "";

            row += j++ + "\t";
            row += distanceLane.avgSpeed.toLocaleString() + "\t";
            row += distanceLane.duration.toLocaleString() + "\t";
            row += distanceLane.distance.toLocaleString() + "\t";

            row += aggregatedTransitions[0].toLocaleString() + "\t";
            row += aggregatedTransitions[1].toLocaleString() + "\t";
            row += aggregatedTransitions[2].toLocaleString() + "\t";

            console.log(row);


            distanceTransitions.forEach((distance) => {
                let subRow = "";

                subRow += i++ + "\t";
                subRow += this.transitionToString(distance.transition) + "\t";
                subRow += distance.avgSpeed.toLocaleString() + "\t";
                subRow += distance.duration.toLocaleString() + "\t";
                subRow += distance.distance.toLocaleString() + "\t";

                transitionTable += subRow + "\n";

            });

            transitionTables.push(transitionTable);
        });

        transitionTables.forEach((table) => {
            console.log("");
            console.log(table);
        });
    }

    private transitionToString([[p1, l1], [p2, l2]]:[[number, number], [number, number]]): string {
        return p1 + "@" + l1 + " => " + p2 + "@" + l2;
    }

    private aggregateTransistions(transitions: Array<Distance>): [number, number, number] {
        let avgSpeed: number = 0,
            sumDuration: number = 0,
            sumDistance: number = 0;

        transitions.forEach((transition) => {
            avgSpeed += transition.avgSpeed;
            sumDuration += transition.duration;
            sumDistance += transition.distance;
        });

        avgSpeed /= transitions.length;

        return [avgSpeed, sumDuration, sumDistance];
    }
}

export {ConsoleResultHandler};