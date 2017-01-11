import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";


@suite
class VehicleScannerTest {

    @test @timeout(5000)"find all vehicles"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            expect(vehicles.length).not.to.be.empty;
            done();
        }).catch((e) => {
            done(e);
        });
    }

}