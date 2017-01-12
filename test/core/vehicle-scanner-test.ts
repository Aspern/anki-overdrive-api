import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";


@suite
class VehicleScannerTest {

    private _id: string = "eb401ef0f82b";

    private _address: string = "eb:40:1e:f0:f8:2b";


    @test @timeout(5000)"find all vehicles"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            expect(vehicles.length).not.to.be.empty;
            done();
        }).catch((e) => done(e));
    }

    @test @timeout(5000)"find vehicle by id"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findById(this._id).then((vehicle) => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch((e) => done(e));
    }

    @test @timeout(5000)"find vehicle by address"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findByAddress(this._address).then((vehicle) => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch((e) => done(e));
    }

}