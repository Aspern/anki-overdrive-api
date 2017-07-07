import * as log4js from "log4js";
import {Logger} from "log4js";
import {Vehicle} from "../core/vehicle/vehicle-interface";
import {isNullOrUndefined} from "util";

type VehicleStore = { [key: string]: Vehicle };
type CommandType = "set-speed" | "connect" | "disconnect";

interface Command {
    vehicleId: string
    name: CommandType,
    params: Array<number>,
}

abstract class AbstractVehicleController<Input> {

    protected _store: VehicleStore = {};
    protected _logger: Logger;

    protected constructor(vehicles: Array<Vehicle>) {
        this.updateVehicles(vehicles);
        this._logger = log4js.getLogger("vehicle-controller");
    }

    handleInput(input: Input): void {
        this.executeCommand(
            this.mapToCommand(input)
        );
    }

    updateVehicles(vehicles: Array<Vehicle>): void {
        let me = this;

        me._store = {};
        vehicles.forEach(vehicle => {
            me._store[vehicle.id] = vehicle;
        });
    }

    abstract mapToCommand(input: Input): Command;

    private executeCommand(command: Command) {
        let logger = this._logger,
            vehicle: Vehicle,
            params: Array<number>;

        try {
            vehicle = this._store[command.vehicleId];

            switch (command.name) {
                case "connect" :
                    if (!vehicle.connected)
                        vehicle.connect()
                            .catch(logger.error)
                    break;
                case "disconnect":
                    if (vehicle.connected)
                        vehicle.disconnect()
                            .catch(logger.error)
                    break;
                case "set-speed" :
                    if (vehicle.connected)
                        vehicle.setSpeed(
                            this.getParamOr(params, 0, 400),
                            this.getParamOr(params, 1, 600)
                        );
                    break;
                default:
                    logger.warn("Unknown command [" + command.name + "].")
            }

        }
        catch
            (error) {
            logger.error("Cannot execute command [" + command.name + "].", error);
        }
    }

    private getParamOr(params: Array<number>, index: number, defaultValue: number) {
        if (isNullOrUndefined(params))
            return defaultValue;

        if (index < params.length)
            return params[index];

        return defaultValue;
    }
}

export {
    AbstractVehicleController,
    Command,
    CommandType
}
    ;