import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {Settings} from "../../settings/settings-interface";
import {JsonSettings} from "../../settings/json-settings";

let scanner = new VehicleScanner(),
    settings: Settings = new JsonSettings(),
    track = settings.getAsTrack("track");

track.eachPiece(piece => {
    console.log(piece.id);
});