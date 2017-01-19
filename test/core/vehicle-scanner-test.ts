import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";


@suite
class VehicleScannerTest {

    static _ID: string;

    static _ADDRESS: string;

    @timeout(5000)
    static before(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            if (vehicles.length > 0) {
                let vehicle = vehicles[0];
                VehicleScannerTest._ID = vehicle.id;
                VehicleScannerTest._ADDRESS = vehicle.address;
                done();
            } else {
                done(new Error("Found no test vehicle."));
            }
        });
    }


    @test @timeout(5000)"find all vehicles"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            expect(vehicles.length).not.to.be.empty;
            done();
        }).catch((e) => done(e));
    }

    @test @timeout(5000)"find vehicle by id"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findById(VehicleScannerTest._ID).then((vehicle) => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch((e) => done(e));
    }

    @test @timeout(5000)"find vehicle by address"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findByAddress(VehicleScannerTest._ADDRESS).then((vehicle) => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch((e) => done(e));
    }

}