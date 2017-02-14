/// <reference path="../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {Settings} from "./settings-interface";
import {Track} from "../core/track/track-interface";
import {isNullOrUndefined} from "util";
import {Piece} from "../core/track/piece-interface";
import {CurvePiece} from "../core/track/curve-piece";
import {StraightPiece} from "../core/track/straight-piece";
import {AnkiOverdriveTrack} from "../core/track/anki-overdrive-track";


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
                pieces.push(new CurvePiece(config.id));
            else if (config.type === "straight")
                pieces.push(new StraightPiece(config.id));
        });

        return AnkiOverdriveTrack.build(pieces);
    }
}

export {JsonSettings}