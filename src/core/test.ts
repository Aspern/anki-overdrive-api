import {VehicleScanner} from "./vehicle/vehicle-scanner";
import {AnkiConsole} from "../controller/console";
import {AnkiOverdriveTrack} from "./track/anki-overdrive-track";
import {CurvePiece} from "./track/curve-piece";
import {StraightPiece} from "./track/straight-piece";
import {PositionUpdateMessage} from "./message/position-update-message";
import {DistanceFilter} from "./enrich/distance-filter";
import {LightConfig} from "./vehicle/light-config";
import {Vehicle} from "./vehicle/vehicle-interface";

let scanner = new VehicleScanner(),
    ankiConsole = new AnkiConsole(),
    track = AnkiOverdriveTrack.build([
        new CurvePiece(18),
        new CurvePiece(23),
        new StraightPiece(39),
        new CurvePiece(20),
        new CurvePiece(17)
    ]),
    filter = new DistanceFilter(track),
    store: {[id: string]: Vehicle} = {};

scanner.findAll().then(vehicles => {

    vehicles.forEach(vehicle => {
        store[vehicle.id] = vehicle;
        filter.addVehicle(vehicle)
    });

    filter.onUpdate((msg: PositionUpdateMessage) => {
        let vehicle = store[msg.vehicleId],
            distances = msg.distances,
            critical = false;

        distances.forEach(distance => {
            if (distance.distance <= 1)
                critical = true;
        })

        if (critical)
            vehicle.setLights([
                new LightConfig()
                    .red()
                    .flash(),
                new LightConfig()
                    .weapon()
                    .flash(),
                new LightConfig()
                    .tail()
                    .flash()
            ]);
        else
            vehicle.setLights([
                new LightConfig()
                    .blue()
                    .steady(),
                new LightConfig()
                    .weapon()
                    .steady(0),
                new LightConfig()
                    .tail()
                    .steady(0)
            ]);
    });


    // vehicles[0].connect().then(vehicle => {
    //     vehicle.setSpeed(400, 250);
    //     setTimeout(() => vehicle.changeLane(-68.0), 2000);
    // });
    //
    // vehicles[1].connect().then(vehicle => {
    //     vehicle.setSpeed(400, 250);
    //     setTimeout(() => vehicle.changeLane(-68.0), 2000);
    // });

    ankiConsole.initializePrompt(vehicles);


}).catch(e => process.exit(1));