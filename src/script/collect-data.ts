import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {JsonSettings} from "../core/settings/json-settings";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../core/message/v2c/position-update-message";
import {Start} from "../core/track/start";
import {KafkaDistanceFilter} from "../controller/kafka/kafka-distance-filter";

let settings = new JsonSettings(),
    setup = settings.getAsSetup("setup"),
    track = settings.getAsTrack("setup.track.pieces"),
    scanner = new VehicleScanner(setup),
    distanceFilter: KafkaDistanceFilter;


function handleError(error: any) {
    console.error(error);
    process.exit();
}

function getSkull(): Promise<Vehicle> {
    let skull: Vehicle = null;

    return new Promise<Vehicle>((resolve, reject) => {
        scanner.findAll().then(vehicles => {
            setup.vehicles.forEach(config => {
                vehicles.forEach(vehicle => {
                    if (config.name === "Skull" && config.uuid === vehicle.id)
                        resolve(vehicle);
                });
            });
            reject("Cannot find skull.");
        }).catch(reject);
    });
}


getSkull().then(skull => {


    skull.connect()
        .then(() => {

            let rounds = 0;
            skull.setOffset(68.0);

            skull.queryBatteryLevel().then(level => {
                console.log("battery: " + level);
            });

            distanceFilter = new KafkaDistanceFilter([skull], track, "vehicle-data");
            distanceFilter.start()
                .then(() => {
                    skull.addListener((message: PositionUpdateMessage) => {
                        if (message.piece === Start._ID) {
                            if (rounds === 20) {
                                skull.disconnect();
                                distanceFilter.stop().then(() => {
                                    console.info("Finished");
                                    process.exit();
                                });
                                process.exit();
                            } else {
                                rounds++;
                                console.log("Driving round " + rounds + ".");
                            }
                        }
                    }, PositionUpdateMessage);

                    skull.setSpeed(1290, 1500);

                }).catch(handleError);
        }).catch(handleError);

}).catch(handleError);