import {IVehicleScanner} from "../vehicle/IVehicleScanner";

interface IAdapter {

    name: string

    install(scanner: IVehicleScanner): void

}

export {IAdapter}