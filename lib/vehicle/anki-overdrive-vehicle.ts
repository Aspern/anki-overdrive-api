import {Peripheral} from "noble";
import {Vehicle} from "./vehicle";

class AnkiOverdriveVehicle implements Vehicle{

    public readonly address: string;
    public readonly connected: boolean;
    public readonly id: string;
    public readonly name: string;
    public readonly offset: number;
    private peripheral: Peripheral

    constructor(peripheral: Peripheral, offset = 0.0, name = "") {
        this.peripheral = peripheral
        this.name = name
        this.offset = offset
    }

    public cancelLaneChange(): void {
    }

    public changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void {
    }

    public connect(): Promise<Vehicle> {
        const me = this

        return new Promise<Vehicle>(resolve => {
            resolve(me)
        });
    }

    public disableSdkMode(): void {
    }

    public disconnect(): Promise<Vehicle> {
        const me = this

        return new Promise<Vehicle>(resolve => {
            resolve(me)
        });
    }

    public enableSdkMode(): void {
    }

    public queryBatterLevel(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public queryPing(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public queryVersion(): Promise<number> {
        return new Promise<number>(resolve => {
            resolve(0)
        });
    }

    public setOffset(offset: number): void {
    }

    public setSpeed(speed: number, acceleration?: number, limit?: number): void {
    }

    public turnRight(): void {
    }

    public turnLeft(): void {
    }

    public uTurn(): void {
    }

    public uTurnJump(): void {
    }

}

export {AnkiOverdriveVehicle}