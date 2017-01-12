import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";
import {message} from "gulp-typescript/release/utils";
import {PositionUpdateMessage} from "../../src/core/message/position-update-message";

@suite
class VehicleTest {

    static _id: string = "eb401ef0f82b";
    static _vehicle: Vehicle;

    @timeout(5000)
    static before(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findById(this._id).then((vehicle) => {
            this._vehicle = vehicle;
            done();
        });
    }

    @test @timeout(5000) "connect and disconnect"(done: Function) {
        VehicleTest._vehicle.connect().then(() => {
            VehicleTest._vehicle
                .disconnect()
                .then(() => done())
                .catch((e) => done(e));
        }).catch((e) => done(e));
    }


}