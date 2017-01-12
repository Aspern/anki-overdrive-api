import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";
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
            this._vehicle
                .connect()
                .then(() => done());
        });
    }

    @timeout(5000)
    static after(done: Function) {
        this._vehicle
            .disconnect()
            .then(() => done())
            .catch((e) => done(e));
    }

    @test @timeout(5000) "set speed and stop"(done: Function) {
        let speed: number = 500,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.speed).approximately(speed, 25);
                VehicleTest._vehicle.removeListener(listener);
                VehicleTest._vehicle.setSpeed(0, 1500);
                done();
            };

        VehicleTest._vehicle.setSpeed(speed, 250);

        // Add listener after 1 second to ensure that vehicle is driving.
        setTimeout(() => {
            VehicleTest._vehicle.addListener(listener, PositionUpdateMessage);
        }, 1000);
    }

    @test @timeout(5000) "change lane"(done: Function) {
        let offset: number = -68.0,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.offset).approximately(offset, 1);
                VehicleTest._vehicle.removeListener(listener);
                VehicleTest._vehicle.setSpeed(0, 1500);
                done();
            };

        VehicleTest._vehicle.setSpeed(500, 250);

        setTimeout(() => {
            VehicleTest._vehicle.changeLane(offset);

            // Add listener after 1 second to ensure that vehicle is driving.
            setTimeout(() => {
                VehicleTest._vehicle.addListener(listener, PositionUpdateMessage);
            }, 1000);
        }), 1500;
    }

    @test @timeout(5000) "set offset"(done: Function) {
        let offset: number = 23.5,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.offset).approximately(offset, 1);
                VehicleTest._vehicle.removeListener(listener);
                VehicleTest._vehicle.setSpeed(0, 1500);
                done();
            };

        VehicleTest._vehicle.setSpeed(500, 250);

        setTimeout(() => {
            VehicleTest._vehicle.setOffset(offset);

            // Add listener after 1 second to ensure that vehicle is driving.
            setTimeout(() => {
                VehicleTest._vehicle.addListener(listener, PositionUpdateMessage);
            }, 1000);
        }), 1500;
    }

    @test @timeout(5000) "query ping"(done: Function) {
        VehicleTest._vehicle
            .queryPing()
            .then((ping) => {
                expect(ping).gt(0);
                done();
            }).catch((e) => done(e));
    }

    @test @timeout(5000) "query version"(done: Function) {
        VehicleTest._vehicle
            .queryVersion()
            .then((version) => {
                expect(version).gt(0);
                done();
            }).catch((e) => done(e));
    }

    @test @timeout(5000) "query battery level"(done: Function) {
        VehicleTest._vehicle
            .queryBatteryLevel()
            .then((batteryLevel) => {
                expect(batteryLevel).gt(0);
                done();
            }).catch((e) => done(e));
    }
}