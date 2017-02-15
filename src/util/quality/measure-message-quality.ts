/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {Settings} from "../../settings/settings-interface";
import {JsonSettings} from "../../settings/json-settings";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {StartPiece} from "../../core/track/start-piece";

let scanner = new VehicleScanner(),
    settings: Settings = new JsonSettings(),
    config: {
        rounds: number,
        vehicle: string,
        offset: number
    } = settings.getAsObject("utils").quality,
    track = settings.getAsTrack("track"),
    currentRount = 0,
    count = 0;


scanner.findById(config.vehicle).then(vehcile => {

    vehcile.connect().then(() => {
        vehcile.setOffset(config.offset);

        let collect = (msg: PositionUpdateMessage) => {
            if (msg.piece === StartPiece._ID)
                currentRount++;

            if (currentRount === config.rounds) {
                vehcile.setSpeed(0, 1500);
                vehcile.removeListener(collect);
                vehcile.disconnect().then(() => {
                    process.exit(1)
                });
            }

            console.log(msg.piece + "/" + msg.location + ":\t" + ++count);
        };

        let findStart = (msg: PositionUpdateMessage) => {
            if (msg.piece === StartPiece._ID) {
                vehcile.removeListener(findStart);
                vehcile.addListener(collect, PositionUpdateMessage);
            }
        };

        vehcile.addListener(findStart, PositionUpdateMessage);
        vehcile.setSpeed(300, 250);

    });

}).catch(e => {
    console.error(e);
    process.exit(1);
});