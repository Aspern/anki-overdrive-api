import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../../src/core/message/position-update-message";
import {VehicleMessage} from "../../src/core/message/vehicle-message";
import {TransitionUpdateMessage} from "../../src/core/message/transition-update-message";
import {DrivingDirection} from "../../src/core/message/driving-direction";


class VehicleTest {

    static _VEHICLE: Vehicle;

    @timeout(5000)
    static before(done: Function) {
        let scanner = new VehicleScanner();

        scanner.findAll().then((vehicles) => {
            if (vehicles.length > 0) {
                let vehicle = vehicles[0];
                VehicleTest._VEHICLE = vehicle;
                VehicleTest._VEHICLE
                    .connect()
                    .then(() => done())
                    .catch((e) => done(e));
            } else {
                done(new Error("Found no test vehicle."));
            }
        });
    }

    @timeout(5000)
    static after(done: Function) {
        this._VEHICLE
            .disconnect()
            .then(() => done())
            .catch((e) => done(e));
    }

    @test @timeout(5000) "vehcile drives with expected speed"(done: Function) {
        let speed: number = 500,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.speed).approximately(speed, 30);
                VehicleTest._VEHICLE.removeListener(listener);
                VehicleTest._VEHICLE.setSpeed(0, 1500);
                done();
            };

        VehicleTest._VEHICLE.setSpeed(speed, 250);

        // Add listener after 1 second to ensure that vehicle is driving.
        setTimeout(() => {
            VehicleTest._VEHICLE.addListener(listener, PositionUpdateMessage);
        }, 2000);
    }

    @test @timeout(5000) "vehcile changes lane correctly"(done: Function) {
        let offset: number = 0,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.offset).approximately(offset, 3.0);
                VehicleTest._VEHICLE.removeListener(listener);
                VehicleTest._VEHICLE.setSpeed(0, 1500);
                done();
            };

        VehicleTest._VEHICLE.setSpeed(500, 250);

        setTimeout(() => {
            VehicleTest._VEHICLE.changeLane(offset);

            // Add listener after 1 second to ensure that vehicle is driving.
            setTimeout(() => {
                VehicleTest._VEHICLE.addListener(listener, PositionUpdateMessage);
            }, 2000);
        }), 2000;
    }

    @test @timeout(5000) "vehciles queries ping"(done: Function) {
        VehicleTest._VEHICLE
            .queryPing()
            .then((ping) => {
                expect(ping).gt(0);
                done();
            }).catch((e) => done(e));
    }

    @test @timeout(5000) "vehicle quries version"(done: Function) {
        VehicleTest._VEHICLE
            .queryVersion()
            .then((version) => {
                expect(version).gt(0);
                done();
            }).catch((e) => done(e));
    }

    @test @timeout(5000) "vehicle queries battery level"(done: Function) {
        VehicleTest._VEHICLE
            .queryBatteryLevel()
            .then((batteryLevel) => {
                expect(batteryLevel).gt(0);
                done();
            }).catch((e) => done(e));
    }

    @test @timeout(5000)"vehicles executes listeners"(done: Function) {
        let accessed = false,
            listener = (msg: VehicleMessage) => {
                expect(msg).to.be.instanceof(VehicleMessage);
                accessed = !accessed;
                VehicleTest._VEHICLE.removeListener(listener);
            };

        VehicleTest._VEHICLE.addListener(listener);
        VehicleTest._VEHICLE.setSpeed(300, 250);

        setTimeout(() => {
            VehicleTest._VEHICLE.setSpeed(0, 1500);
            expect(accessed).to.be.true;
            done();
        }, 3000);
    }

    @test @timeout(5000)"vehicle executes typed listeners"(done: Function) {
        let listener = (msg: TransitionUpdateMessage) => {
            expect(msg).to.be.instanceof(TransitionUpdateMessage);
        }

        VehicleTest._VEHICLE.addListener(listener, TransitionUpdateMessage);
        VehicleTest._VEHICLE.setSpeed(300, 250);

        setTimeout(() => {
            VehicleTest._VEHICLE.setSpeed(0, 1500);
            VehicleTest._VEHICLE.removeListener(listener);
            done();
        }, 3000);

    }

    @test @timeout(5000)"vehicle executes u-turn"(done: Function) {
        var direction: DrivingDirection,
            executed = false,
            listener1 = (msg: TransitionUpdateMessage) => {
                direction = msg.direction;
                VehicleTest._VEHICLE.removeListener(listener1);
                VehicleTest._VEHICLE.addListener(listener2, TransitionUpdateMessage);

                setTimeout(() => {
                    VehicleTest._VEHICLE.uTurn();
                    executed = true;
                }, 2000);
            },
            listener2 = (msg: TransitionUpdateMessage) => {
                if (executed && direction === DrivingDirection.FORWARD)
                    expect(msg.direction).to.be.equal(DrivingDirection.REVERSE);
                else if (executed)
                    expect(msg.direction).to.be.equal(DrivingDirection.FORWARD);
            }

        VehicleTest._VEHICLE.addListener(listener1, TransitionUpdateMessage);
        VehicleTest._VEHICLE.setSpeed(300, 250);

        setTimeout(() => {
            VehicleTest._VEHICLE.setSpeed(0, 1500);
            VehicleTest._VEHICLE.removeListener(listener2);
            done();
        }, 4000);

    }
}