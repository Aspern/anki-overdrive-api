import {IVehicle} from "./IVehicle";

interface IVehicleScanner {

    timeout: number

    onError(handler: (error: any) => any): void

    findAll(): Promise<IVehicle[]>

    findById(id: string): Promise<IVehicle>

    findByAddress(address: string): Promise<IVehicle>

    findAny(): Promise<IVehicle>

}

export {IVehicleScanner}