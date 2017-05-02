import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScannerImpl} from "../../src/core/vehicle/vehicle-scanner-impl";


@suite
class VehicleScannerTest {

    static _ID: string;
    static _ADDRESS: string;

    @timeout(5000)
    static before(done) {
        let scanner = new VehicleScannerImpl();

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

    @test @timeout(5000)"find all vehicles"(done) {
        let scanner = new VehicleScannerImpl();

        scanner.findAll().then((vehicles) => {
            expect(vehicles.length).not.to.be.empty;
            done();
        }).catch(e => done(e));
    }

    @test @timeout(5000)"find vehicle by id"(done) {
        let scanner = new VehicleScannerImpl(),
            id = VehicleScannerTest._ID;

        scanner.findById(id).then(vehicle => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch((e) => done(e));
    }

    @test @timeout(5000)"find vehicle by address"(done) {
        let scanner = new VehicleScannerImpl(),
            address = VehicleScannerTest._ADDRESS;

        scanner.findByAddress(address).then(vehicle => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch(e => done(e));
    }

    @test @timeout(5000)"find any vehicle"(done) {
        let scanner = new VehicleScannerImpl();

        scanner.findAny().then(vehicle => {
            expect(vehicle).not.to.be.null;
            done();
        }).catch(e => done(e));
    }

}