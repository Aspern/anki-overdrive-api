/// <reference path="../../decl/jsonfile.d.ts"/>
import * as files from "jsonfile";
import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";
import {JsonSettings} from "../core/settings/json-settings";

let optimalSpeeds: { [key: string]: number } = files.readFileSync("resources/optimal-speeds.json"),
    settings = new JsonSettings(),
    track = settings.getAsTrack("setup.track.pieces");


MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {

    if (!isNullOrUndefined(error)) {
        console.error(error);
        process.exit();
    }

});