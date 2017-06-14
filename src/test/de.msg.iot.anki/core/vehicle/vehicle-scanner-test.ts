import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScannerImpl} from "../../../../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-impl";
import {JsonSettings} from "../../../../main/de.msg.iot.anki/core/settings/json-settings";

@suite
class VehicleScannerTest {

    static SETTINGS = new JsonSettings("src/test/resources/test-settings.json");

    @test
    @timeout(5000)
    findAll(done: Function) {
        let setup = VehicleScannerTest.SETTINGS.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup),
            numVehicles = setup.vehicles.length;

        scanner.findAll().then(vehicles => {
            expect(vehicles.length).to.be.equals(numVehicles);
            done();
        }).catch(error => done(error));
    }

    @test
    @timeout(5000)
    findById(done: Function) {
        let setup = VehicleScannerTest.SETTINGS.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup),
            vehicleId = setup.vehicles[0].uuid;

        scanner.findById(vehicleId)
            .then(vehicle => {
                expect(vehicle.id).to.be.equals(vehicleId);
                done();
            }).catch(error => done(error));
    }

    @test
    @timeout(5000)
    findByAddress(done: Function) {
        let setup = VehicleScannerTest.SETTINGS.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup),
            address = setup.vehicles[0].address;

        scanner.findByAddress(address)
            .then(vehicle => {
                expect(vehicle.address).to.be.equals(address);
                done();
            }).catch(error => done(error));
    }

    @test
    @timeout(5000)
    findAny(done: Function) {
        let setup = VehicleScannerTest.SETTINGS.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup);

        scanner.findAny()
            .then(vehicle => {
                expect(vehicle.id).not.to.be.null;
                done();
            }).catch(error => done(error));
    }

}