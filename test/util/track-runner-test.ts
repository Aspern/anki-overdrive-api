import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";

@suite
class TrackRunnerTest {


    @test @timeout(5000)"track runner executes each line"(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            expect(vehicles.length).not.to.be.empty;
            done();
        }).catch((e) => done(e));
    }

    private findAnyVehicle(): Promise<Vehicle> {
        return new Promise<Vehicle>((resolve, reject) =>)
    }


}