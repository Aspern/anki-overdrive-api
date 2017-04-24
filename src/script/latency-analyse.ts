import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {JsonSettings} from "../core/settings/json-settings";

let settings = new JsonSettings(),
    setup = settings.getAsSetup("setup"),
    scanner = new VehicleScanner(setup),
    maxTries = 100,
    tries: Array<number> = [],
    pings: Array<number> = [];

function handleError(e: Error) {
    if (e) {
        console.error(e);
        process.exit();
    }
}

scanner.findAny().then(vehicle => {

    for (let i = 0; i < maxTries; ++i)
        tries.push(i);

    vehicle.connect().then(() => {
        tries.reduce((promise, k) => {

            return promise.then((delta: Array<number>) => {
                return vehicle.queryPing().then(ping => {
                    delta.push(ping);
                    return delta;
                });
            });

        }, Promise.resolve(pings)).then(() => {
            pings.forEach(ping => {
                console.log(ping)
            });
        }).catch(handleError);
    });
}).catch(handleError);