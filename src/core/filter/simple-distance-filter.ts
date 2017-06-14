/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {AbstractDistanceFilter} from "./abstract-distance-filter";
import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";

/**
 * Implementation of the AbstractDistanceFilter. This filter uses a local
 * 'resources/distances.json' file to find the distances between each location on the track.
 */
class SimpleDistanceFilter extends AbstractDistanceFilter {

    private _transitionData: { [key: string]: number } = {};

    constructor() {
        super();
        this._transitionData = jsonfile.readFileSync("resources/distances.json");
        let me = this;

        MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
            if (!isNullOrUndefined(error))
                console.error(error);

            let collection = db.collection("distances");

            collection.find({}).toArray((error, docs) => {
                if (!isNullOrUndefined(error))
                    console.log(error);

                docs.forEach(doc => {
                    me._transitionData[doc.key] = doc.avg;
                });
            });
        });

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