import {Vehicle} from "./vehicle";

interface VehicleScanner {

    findAll(): Promise<Vehicle[]>

    findById(id: string): Promise<Vehicle>

    findByAddress(address: string): Promise<Vehicle>

    findAny(): Promise<Vehicle>

}

export {VehicleScanner}