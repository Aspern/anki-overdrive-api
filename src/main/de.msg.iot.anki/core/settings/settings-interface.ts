import {SetupConfig} from "./setup-config";
import {Track} from "../track/track-interface";

/**
 * Class to access user defined settings for the application.
 */
interface Settings {

    /**
     * Returns settings of any type.
     *
     * @param key Name of the setting
     */
    get(key: string): string;

    /**
     * Returns settings as string or the default value if it does not exist.
     *
     * @param key Name of the setting
     * @param defaultValue Default value
     */
    getAsString(key: string, defaultValue: string): string;

    /**
     * Returns settings as integer or the default value if it does not exist.
     *
     * @param key Name of the setting
     * @param defaultValue Default value
     */
    getAsInt(key: string, defaultValue: number): number;

    /**
     * Returns settings as float or the default value if it does not exist.
     *
     * @param key Name of the setting
     * @param defaultValue  Default value
     */
    getAsFloat(key: string, defaultValue: number): number;

    /**
     *  Returns settings as boolean or the default value if it does not exist.
     *
     * @param key Name of the setting
     * @param defaultValue  Default value
     */
    getAsBoolean(key: string, defaultValue: boolean): boolean;

    /**
     * Returns settings as Date or the default value if it does not exist.
     *
     * @param key Name of the setting
     * @param defaultValue Default value
     */
    getAsDate(key: string, defaultValue: Date): Date;

    /**
     * Returns settings as Object of any type or the null if it does not exist.
     *
     * @param key Name of the setting
     */
    getAsObject(key: string) : any;

    /**
     * Returns settings as a Track object or null if it does not exist.
     *
     * @param key Name of the setting
     */
    getAsTrack(key: string): Track;

    /**
     * Returns setting as a setup object of a whole Track with vehicles.
     *
     * @param key Name of the setting
     */
    getAsSetup(key: string) : SetupConfig;

}

export {Settings};
