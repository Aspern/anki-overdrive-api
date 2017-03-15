/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {Settings} from "./settings-interface";
import {Track} from "../track/track-interface";
import {isNullOrUndefined} from "util";
import {Piece} from "../track/piece-interface";
import {Curve} from "../track/curve";
import {Straight} from "../track/straight";
import {AnkiOverdriveTrack} from "../track/anki-overdrive-track";
import {Setup} from "../setup";

/**
 * This implementation of settings uses a simple json file to find settings. The class uses the
 * 'resources/settings.json' file as a default if no file is given.
 */
class JsonSettings implements Settings {

    private _map: {[key: string]: any} = {};

    constructor(file = "resources/settings.json") {
        this._map = jsonfile.readFileSync(file);
    }


    get(key: string): string {
        let value: any = this._map[key];

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
        let configs: Array<{type: string, id: number}> = this.getAsObject(key),
            pieces: Array<Piece> = [];

        configs.forEach(config => {
            if (config.type === "curve")
                pieces.push(new Curve(config.id));
            else if (config.type === "straight")
                pieces.push(new Straight(config.id));
        });

        return AnkiOverdriveTrack.build(pieces);
    }


    getAsSetup(key: string): Setup {
        let object : {
            uuid : string,
            vehicles: Array<{uuid:string, address:string, name:string}>,
            track : {pieces:Array<{pieceId: number, type: string}>}
        } = this.getAsObject("setup"),
            setup = new Setup();

        setup.uuid = object.uuid;
        setup.vehicles = object.vehicles;
        setup.track = object.track;

        return setup;
    }
}

export {JsonSettings}