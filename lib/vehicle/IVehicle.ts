interface IVehicle {

    address: string
    connected: boolean
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

    setSpeed(speed: number, acceleration?: number, limit?: number): void

    turnRight(): void

    turnLeft(): void

    uTurn(): void

    uTurnJump(): void
}

export {IVehicle}