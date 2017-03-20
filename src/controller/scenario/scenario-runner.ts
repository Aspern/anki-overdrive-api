import {VehicleScanner} from "../../core/vehicle/vehicle-scanner";
import {isNullOrUndefined} from "util";
import {CollisionScenario} from "./collision-scenario";
import {Scenario} from "./scenario-interface";
import {SimpleDistanceFilter} from "../../core/filter/simple-distance-filter";
import {JsonSettings} from "../../core/settings/json-settings";
let scanner = new VehicleScanner(),
    scenario: Scenario,
    settings = new JsonSettings(),
    track = settings.getAsTrack("track");

function handleError(e: Error) {
    if (!isNullOrUndefined(e)) {
        console.error(e)
        process.exit()
    }
}

scanner.findAll().then(vehicles => {

    scenario = new CollisionScenario(vehicles[0], vehicles[1]);

    let filter = new SimpleDistanceFilter();
    filter.init([track, [vehicles[0], vehicles[1]]]);
    filter.onUpdate(message => {
        scenario.onUpdate(message);
    });
    filter.start().then(() => {
        vehicles[0].connect();
        vehicles[1].connect();

        setTimeout(() => {
            console.log("Starting scenario.");
            scenario.start().then(() => {
                vehicles[0].disconnect();
                vehicles[1].disconnect();
                console.log("Scenario finished.");
                process.exit();
            });
        }, 2000);
    });


}).catch(handleError)