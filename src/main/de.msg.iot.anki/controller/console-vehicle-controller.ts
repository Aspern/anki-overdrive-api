import {AbstractVehicleController, Command} from "./abstract-vehicle-controller";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {isNullOrUndefined} from "util";

class ConsoleVehicleController extends AbstractVehicleController<string> {

    private _ids: Array<string> = [];

    constructor(vehicles: Array<Vehicle>) {
        super(vehicles);
        for (let key in this._store) {
            this._store.hasOwnProperty(key)
            this._ids.push(key);
        }
    }

    mapToCommand(input: string): Command {
        let command: Command = null;

        if (isNullOrUndefined(input))
            return command;

        try {
            let fragments = input.split(" "),
                name: any = fragments[0],
                index = parseInt(fragments[1]),
                stringParams = fragments.splice(2),
                params: Array<number> = [];

            if (!isNullOrUndefined(stringParams))
                stringParams.forEach(param => {
                    params.push(parseInt(param));
                });

            command = {
                name: name,
                vehicleId: this._ids[index],
                params: params
            };

        } catch (error) {
            this._logger.error("Malformed command line [" + input + "].", error)
        }

        return command;


    }
}

export {ConsoleVehicleController}