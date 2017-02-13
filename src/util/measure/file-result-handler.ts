/// <reference path="../../../decl/jsonfile.d.ts"/>
import * as jsonfile from "jsonfile";
import {ResultHandler} from "./result-handler-interface";
import {Distance} from "./distance";


class FileResultHandler implements ResultHandler {

    map: {[key: string]: number} = {};

    handle(result: Array<[Distance, Array<Distance>]>): void {
        let me = this;

        try {

            result.forEach(result => {
                let transitions = result[1];

                transitions.forEach(transition => {
                    let key = transition.transition
                        .replace(/@/gi, "")
                        .replace(/ => /gi, "");

                    me.map[key] = transition.distance;
                });
            });

            jsonfile.writeFileSync("./distances.json", me.map);

        } catch (e) {
            console.error(e);
        }


    }
}

export {FileResultHandler};