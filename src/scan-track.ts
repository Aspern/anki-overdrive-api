import {VehicleScanner} from "./vehicle/VehicleScanner";
import {Bluetooth} from "./index";
import {Track} from "./track/Track";
import {IVehicle} from "./vehicle/IVehicle";

const scanner = new VehicleScanner(new Bluetooth())

scanner.findAny().then((vehicle:IVehicle) => {

    Track.scan(vehicle).then(track => {
        track.forEach(piece => {
            console.log(` ${piece.id} `)
        })

    })

})