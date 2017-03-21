import {VehicleMessage} from "../../core/message/vehicle-message";
interface Scenario {

    start() : Promise<void>;

    onUpdate(message:VehicleMessage) : void;

    interrupt() : Promise<void>;

    isRunning() : boolean;

}

export {Scenario}