/// <reference path="../../../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {Settings} from "./settings-interface";
import {isNullOrUndefined} from "util";
import {SetupConfig} from "./setup-config";
import {Track} from "../track/track-interface";
import {Piece} from "../track/piece-interface";
import {Curve} from "../track/curve";
import {Straight} from "../track/straight";
import {TrackImpl} from "../track/track-impl";


/**
 * This implementation of settings uses a simple json file to find settings. The class uses the
 * 'resources/settings.json' file as a default if no file is given.
 */
class JsonSettings implements Settings {

    private static PATH_SEPARATOR = ".";
    private _map: { [key: string]: any } = {};

    constructor(file = "src/main/resources/settings.json") {
        this._map = jsonfile.readFileSync(file);
    }


    get(key: string): string {
        let path = key.split(JsonSettings.PATH_SEPARATOR),
            value = this._map[path[0]],
            i = 1;

        for (; i < path.length; i++)
            value = value[path[i]];

        if (typeof value === "string" || value instanceof String)
            return "" + value;

        return JSON.stringify(value);
    }

    getAsString(key: string, defaultValue: string): string {
        let value = this.get(key);

        if (isNullOrUndefined(value))
            return defaultValue;

        return value;
    }

    getAsInt(key: string, defaultValue: number): number {
        let value = this.get(key);

        if (isNullOrUndefined(value))
            return defaultValue;

        return parseInt(value);
    }

    getAsFloat(key: string, defaultValue: number): number {
        let value = this.get(key);

        if (isNullOrUndefined(value))
            return defaultValue;

        return parseFloat(value);
    }

    getAsBoolean(key: string, defaultValue: boolean): boolean {
        let value = this.get(key);


        if (typeof value !== "boolean" && isNullOrUndefined(value))
            return defaultValue;

        return typeof value === "boolean" ? value : value === "true";
    }

    getAsDate(key: string, defaultValue: Date): Date {
        let value = this.get(key);

        if (isNullOrUndefined(value))
            return defaultValue;

        if (value.match(/^[0-9]*$/))
            return new Date(parseInt(value));

        return new Date(value);
    }

    getAsObject(key: string): any {
        return JSON.parse(this.get(key));
    }

    getAsTrack(key: string): Track {
        let configs: Array<{ type: string, pieceId: number }> = this.getAsObject(key),
            pieces: Array<Piece> = [];

        configs.forEach(config => {
            if (config.type === "curve")
                pieces.push(new Curve(config.pieceId));
            else if (config.type === "straight")
                pieces.push(new Straight(config.pieceId));
        });

        return TrackImpl.build(pieces);
    }


    getAsSetup(key: string): SetupConfig {
        return this.getAsObject(key);
    }
}

export {JsonSettings}