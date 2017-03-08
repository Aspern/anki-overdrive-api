import {ResultHandler} from "./result-handler-interface";
import {Result} from "./result";

class ConsoleResultHandler implements ResultHandler {

    private _table: string;

    constructor() {
        this._table = "Lane \t Duration [sec] \t AvgSpeed [mm/sec] \t Length [mm] \n";
        this._table += "------------------------------------------------------------------------------------\n";
    }

    handle(result: Array<[Result, Array<Result>]>): void {
        for (let lane = 0; lane < result.length; ++lane) {
            let laneResult: Result = result[lane][0],
                transitionResults: Array<Result> = result[lane][1];

            this.collectLane(laneResult);
            this.printTransitions(transitionResults, lane);
        }

        console.log("");
        console.log(this._table);
    }

    private collectLane(result: Result): void {
        let row: string = "";

        row += result.lane + "\t\t\t";
        row += this.printNumber(result.duration) + "\t\t\t\t";
        row += this.printNumber(result.avgSpeed) + "\t\t\t";
        row += this.printNumber(result.distance) + "\n";

        this._table += row;
    }

    private printTransitions(results: Array<Result>, lane: number): void {
        let totalDuration: number = 0,
            totalDistance: number = 0;

        console.log("Transitions for last lane: " + lane);
        console.log("Transition \t\t Duration [sec] \t AvgSpeed [mm/sec] \t Result [mm]");
        console.log("------------------------------------------------------------------------------------------------");
        for (let i = 0; i < results.length; ++i) {
            let distance = results[i],
                row = "";

            row += distance.transition + "\t\t\t";
            row += this.printNumber(distance.duration) + "\t\t\t\t";
            row += this.printNumber(distance.avgSpeed) + "\t\t\t";
            row += this.printNumber(distance.distance);

            totalDuration += distance.duration;
            totalDistance += distance.distance;

            console.log(row);
        }
        console.log("------------------------------------------------------------------------------------------------");
        console.log("TOTAL\t\t\t\t\t" + this.printNumber(totalDuration) + "\t\t\t\t\t\t\t\t\t" +
            this.printNumber(totalDistance));

        console.log("");
    }

    private printNumber(n: number): string {
        return n.toLocaleString(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        });
    }
}

export {ConsoleResultHandler};