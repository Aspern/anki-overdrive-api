import {VehicleScanner} from "../core/vehicle/vehicle-scanner";
import {JsonSettings} from "../core/settings/json-settings";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";
import {ProfitScenario} from "../controller/scenario/profit-scenario";
import {PositionUpdateMessage} from "../core/message/v2c/position-update-message";
import {Start} from "../core/track/start";
import {KafkaDistanceFilter} from "../controller/kafka/kafka-distance-filter";

type DistanceStore = { [key: string]: number };

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

function getDistances(): Promise<DistanceStore> {
    let store: DistanceStore = {};

    return new Promise<DistanceStore>((resolve, reject) => {
        MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
            if (!isNullOrUndefined(error))
                reject(error);

            let collection = db.collection("distances");
            collection.find({})
                .toArray((error, documents) => {
                    if (!isNullOrUndefined(error))
                        reject(error);

                    documents.forEach(document => {
                        store[document.key] = document.avg;
                    });
                });

        });

        setTimeout(() => {
            resolve(store);
        }, 5000);
    });

}

getSkull().then(skull => {

    getDistances().then(store => {

        let distance = 0;

        track.eachTransition((t1, t2) => {
            let key = "" + t1[0] + t1[1] + t2[0] + t2[1];
            distance += store[key];
        }, 15);

        skull.connect()
            .then(() => {
                let scenario = new ProfitScenario(skull, track),
                    rounds = 0,
                    startTime: Date,
                    endTime: Date;

                skull.setOffset(68.0);

                distanceFilter = new KafkaDistanceFilter([skull], track, "vehicle-data");
                distanceFilter.start()
                    .then(() => {
                        skull.addListener((message: PositionUpdateMessage) => {
                            if (rounds === 50) {
                                endTime = new Date();
                                scenario.interrupt().then(() => {
                                    distanceFilter.unregisterUpdateHandler();
                                    console.log("distance =\t" + distance);
                                    console.log("startTime =\t" + startTime);
                                    console.log("endTime =\t" + endTime);
                                    console.log("avgSpeed = \t" + (rounds * distance) / (endTime.getUTCMilliseconds() - startTime.getUTCMilliseconds()));
                                });
                            }

                            if (message.piece === Start._ID) {
                                if (rounds === 0)
                                    startTime = new Date();
                                rounds++;
                                console.log("Driving round " + rounds + ".");
                            }

                        }, PositionUpdateMessage);

                        distanceFilter.registerUpdateHandler(scenario.onUpdate, scenario);
                        scenario.start().catch(handleError);

                    }).catch(handleError);

            }).catch(handleError);

    }).catch(handleError);

}).catch(handleError);