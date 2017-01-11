import {VehicleMessage} from "../message/vehicle-message";

interface Vehicle {

    connect(): Promise<void>;

    disconnect(): Promise<void>;

    setSpeed(speed: number, acceleration?: number): void;

    setOffset(offset: number): void;

    changeLane(offset: number, speed?: number, acceleration?: number): void;

    cancelLaneChange() : void;

    turnLeft(): void;

    turnRight(): void;

    uTurn(): void;

    uTurnJump(): void;

    setSdkMode(on: boolean): void;

    queryPing(): Promise<number>;

    queryVersion(): Promise<number>;

    queryBatteryLevel(): Promise<number>;

    addListener(listener: (message: VehicleMessage) => any, filer?: any): void;

    removeListener(listener: (message: VehicleMessage) => any): void;
}

export {Vehicle}
