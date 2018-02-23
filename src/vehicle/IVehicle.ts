import {IVehicleMessage} from "../message/IVehicleMessage";

interface IVehicle {

    address: string
    id: string
    name: string
    offset: number

    cancelLaneChange(): void

    changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void

    connect(): Promise<IVehicle>

    disableSdkMode(): void

    disconnect(): Promise<IVehicle>

    enableSdkMode(): void

    queryBatterLevel(): Promise<number>

    queryPing(): Promise<number>

    queryVersion(): Promise<number>

    setOffset(offset: number): void

    setSpeed(speed: number, acceleration?: number, limit?: boolean): void

    turnRight(): void

    turnLeft(): void

    uTurn(): void

    uTurnJump(): void

    addListener<T extends IVehicleMessage>(listener: (message: T) => any): void

    removeListener<T extends IVehicleMessage>(listener: (message: T) => any): void
}

export {IVehicle}