/// <reference path="../../decl/elasticsearch.d.ts"/>
import * as elasticsearch from "elasticsearch";
import {VehicleScanner} from "../vehicle/vehicle-scanner";
import {error} from "util";

class ElasticsearchPipeline {


    collectData(): void {
        let scanner = new VehicleScanner(),
            client = new elasticsearch.Client(),
            data;

        scanner.findAll().then((vehicles) => {
            vehicles.forEach((vehicle) => {
                vehicle.addListener((message) => {
                    data = message;
                    delete data.payload;

                    client.bulk({
                        body: [
                            {index: {_index: 'anki', _type: 'vehicle-position'}},
                            message
                        ]
                    }, (error: Error, response: any) => {
                        if (error)
                            console.error(error);
                    });
                });

                vehicle.connect().then(() => {
                    vehicle.setSpeed(500, 500);
                });

            });
        }).catch(console.error);
    }


}

export {ElasticsearchPipeline};