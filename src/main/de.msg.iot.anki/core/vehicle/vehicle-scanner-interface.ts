import {Vehicle} from "./vehicle-interface";

/**
 * The scanner finds vehicles from Anki OVERDRIVE belonging to a specific setup, in the
 * Bluetooth Low Energy (BLE) network.
 */
interface VehicleScanner {

    /**
     * Finds all vehicles vehicles of the setup.
     *
     * @return List with all found vehicles
     */
    findAll(): Promise<Array<Vehicle>>;

    /**
     * Finds a vehicle by its id in the setup.
     *
     * @param id Unique id of the vehicle
     * @return Vehicle with given id or null
     */
    findById(id: string): Promise<Vehicle | null>;

    /**
     *Finds a vehicle by its address in the setup.
     *
     * @param address Unique address of the vehicle
     * @return Vehicle with given id or null
     */
    findByAddress(address: string): Promise<Vehicle | null>;

    /**
     * Returns any vehicle in the setup.
     *
     * @return Vehicle or null
     */
    findAny(): Promise<Vehicle | null>;

}

export {VehicleScanner};