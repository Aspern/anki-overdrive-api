/// <reference path="../../decl/jsonfile.d.ts"/>
import * as files from "jsonfile";
import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";
import {JsonSettings} from "../core/settings/json-settings";
import M = require("minimatch");

let optimalSpeeds: { [key: string]: number } = files.readFileSync("resources/optimal-speeds.json"),
    settings = new JsonSettings(),
    track = settings.getAsTrack("setup.track.pieces");


MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {

    if (!isNullOrUndefined(error)) {
        console.error(error);
        process.exit();
    }

    let collection = db.collection("acceleration-commands");

    collection.drop().then();


// //52 9 runden
//     let distances: Array<number> = [];
//
//     collection.find({}).toArray().then(document => {
//         document.forEach(doc => {
//             if(["18351836",
//                 "18361837",
//                 "18372035",
//                 "20352036",
//                 "20362037",
//                 "20373645",
//                 "36453646",
//                 "36463647",
//                 "36473945",
//                 "39453946",
//                 "39463947",
//                 "39471735",
//                 "17351736",
//                 "17361737",
//                 "17372035",
//                 "20352036",
//                 "20362037",
//                 "20373430",
//                 "34303431",
//                 "34313315",
//                 "33154045",
//                 "40454046",
//                 "40464047",
//                 "40471835"].indexOf(doc.key) > -1)
//                 distances.push(doc.avg)
//         });
    });


    setTimeout(() =>  {
        let sum = 0;

        distances.forEach(distance => sum += distance);

        console.log(sum)

    }, 5000)

});