import {Track} from "../core/track/track-interface";

interface Settings {

    get(key: string): string;

    getAsString(key: string, defaultValue: string): string;

    getAsInt(key: string, defaultValue: number): number;

    getAsFloat(key: string, defaultValue: number): number;

    getAsBoolean(key: string, defaultValue: boolean): boolean;

    getAsDate(key: string, defaultValue: Date): Date;

    getAsObject(key: string) : any;

    getAsTrack(key: string): Track

}

export {Settings};
