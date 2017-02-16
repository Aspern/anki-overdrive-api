/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {AbstractDistanceFilter} from "./abstract-distance-filter";

class SimpleDistanceFilter extends AbstractDistanceFilter {

    private _transitionData: {[key: string]: number};

    constructor() {
        super();
        this._transitionData = jsonfile.readFileSync("resources/distances.json");
    }

    protected handleError(e: Error): void {
        console.error(e);
    }

    protected getDistanceForTransition(l1: [number, number], l2: [number, number]): number {
        let key: string = ""
            + l1[0]
            + l1[1]
            + l2[0]
            + l2[1];

        return this._transitionData[key];
    }
}

export {SimpleDistanceFilter};