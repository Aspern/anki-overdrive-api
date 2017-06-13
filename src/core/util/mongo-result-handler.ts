import {ResultHandler} from "./result-handler-interface";
import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";
import {Result} from "./result";

function getAverage(distances: Array<number>): number {
    let avg = 0;
    distances.forEach(distance => {
        avg += distance;
    });
    return avg / distances.length;
}

function getMedian(distances: Array<number>): number {
    distances.sort((a, b) => a - b);
    return distances[Math.round(distances.length / 2)];
}

class MongoResultHandler implements ResultHandler {


    handle(result: Array<[Result, Array<Result>]>): void {

        MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
            if (!isNullOrUndefined(error)) {
                console.error(error);
                process.exit();
            }
            let collection = db.collection("distances");

            result.forEach(result => {
                let transitions = result[1];

                transitions.forEach(transition => {
                    let key = transition.transition
                            .replace(/@/gi, "")
                            .replace(/ => /gi, ""),
                        distance = transition.distance;

                    collection.find({
                        key: key
                    }).toArray((error, docs) => {
                        if (!isNullOrUndefined(error))
                            console.log(error);

                        if (docs.length === 0) {
                            collection.insertOne({
                                key: key,
                                distances: [distance],
                                avg: distance,
                                median: distance
                            }).catch(error => console.error(error));
                        } else {
                            docs.forEach(doc => {
                                let distances = doc.distances;
                                distances.push(distance);

                                collection.updateOne({
                                    key: doc.key
                                }, {
                                    $set: {
                                        distances: distances,
                                        avg: getAverage(distances),
                                        median: getMedian(distances)
                                    }
                                }, error => {
                                    if (!isNullOrUndefined(error))
                                        console.error(error);
                                });
                            });
                        }
                    });
                });
            });
        });
    }
}

export {MongoResultHandler};