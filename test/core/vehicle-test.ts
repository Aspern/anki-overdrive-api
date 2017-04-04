import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";
import {PositionUpdateMessage} from "../../src/core/message/v2c/position-update-message";
import {VehicleMessage} from "../../src/core/message/vehicle-message";
import {TransitionUpdateMessage} from "../../src/core/message/v2c/transition-update-message";
import {DrivingDirection} from "../../src/core/message/driving-direction";
import {LightConfig} from "../../src/core/vehicle/light-config";


@suite
class VehicleTest {

    static _VEHICLE: Vehicle;

    @timeout(5000)
    static before(done) {
        let scanner = new VehicleScanner();

        scanner.findAll().then(vehicles => {
            if (vehicles.length > 0) {
                let vehicle = vehicles[0];
                VehicleTest._VEHICLE = vehicle;
                VehicleTest._VEHICLE
                    .connect()
                    .then(() => done())
                    .catch(e => done(e));
            } else {
                done(new Error("Found no test vehicle."));
            }
        });
    }

    @timeout(5000)
    static after(done) {
        this._VEHICLE
            .disconnect()
            .then(() => done())
            .catch(e => done(e));
    }

    @test @timeout(5000) "set speed and acceleration"(done) {
        let speed: number = 500,
            vehicle = VehicleTest._VEHICLE,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.speed).approximately(speed, 30);
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                done();
            };

        vehicle.setSpeed(speed, 250);

        setTimeout(() => {
            vehicle.addListener(listener, PositionUpdateMessage);
        }, 2000);
    }

    @test @timeout(5000) "change lane"(done) {
        let offset: number = 0,
            vehicle = VehicleTest._VEHICLE,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.offset).approximately(offset, 3.0);
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                done();
            };

        vehicle.setSpeed(500, 250);

        setTimeout(() => {
            vehicle.changeLane(offset);

            setTimeout(() => {
                vehicle.addListener(listener, PositionUpdateMessage);
            }, 2000);
        }), 2000;
    }

    @test @timeout(5000) "query ping"(done) {
        VehicleTest._VEHICLE
            .queryPing()
            .then((ping) => {
                expect(ping).gt(0);
                done();
            }).catch(e => done(e));
    }

    @test @timeout(5000) "query version"(done) {
        VehicleTest._VEHICLE
            .queryVersion()
            .then((version) => {
                expect(version).gt(0);
                done();
            }).catch(e => done(e));
    }

    @test @timeout(5000) "query battery level"(done) {
        VehicleTest._VEHICLE
            .queryBatteryLevel()
            .then((batteryLevel) => {
                expect(batteryLevel).gt(0);
                done();
            }).catch(e => done(e));
    }

    @test @timeout(5000)"executes listener"(done) {
        let accessed = false,
            vehicle = VehicleTest._VEHICLE,
            listener = (msg: VehicleMessage) => {
                expect(msg).to.be.instanceof(VehicleMessage);
                accessed = !accessed;
                vehicle.removeListener(listener);
            };

        vehicle.addListener(listener);
        vehicle.setSpeed(300, 250);

        setTimeout(() => {
            vehicle.setSpeed(0, 1500);
            expect(accessed).to.be.true;
            done();
        }, 3000);
    }

    @test @timeout(5000)"executes typed listener"(done) {
        let vehicle = VehicleTest._VEHICLE,
            listener = (msg: TransitionUpdateMessage) => {
                expect(msg).to.be.instanceof(TransitionUpdateMessage);
            }

        vehicle.addListener(listener, TransitionUpdateMessage);
        vehicle.setSpeed(300, 250);

        setTimeout(() => {
            vehicle.setSpeed(0, 1500);
            vehicle.removeListener(listener);
            done();
        }, 3000);

    }

    @test @timeout(5000)"u-turn"(done) {
        var direction: DrivingDirection,
            executed = false,
            vehicle = VehicleTest._VEHICLE,
            listener1 = (msg: TransitionUpdateMessage) => {
                direction = msg.direction;
                console.log("direction: " + msg.direction);
                vehicle.removeListener(listener1);
                vehicle.addListener(listener2, TransitionUpdateMessage);

                setTimeout(() => {
                    vehicle.uTurn();
                    executed = true;
                }, 2000);
            },
            listener2 = (msg: TransitionUpdateMessage) => {
                if (executed && direction === DrivingDirection.FORWARD)
                    expect(msg.direction).to.be.equal(DrivingDirection.REVERSE);
                else if (executed)
                    expect(msg.direction).to.be.equal(DrivingDirection.FORWARD);
            }

        vehicle.addListener(listener1, TransitionUpdateMessage);
        vehicle.setSpeed(300, 250);

        setTimeout(() => {
            vehicle.setSpeed(0, 1500);
            vehicle.removeListener(listener2);
            done();
        }, 4000);

    }

    @test @timeout(5000)"set offset"(done) {
        let vehicle = VehicleTest._VEHICLE,
            offset = 8.5,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.offset).to.be.approximately(offset, 0.5);
            };

        vehicle.setOffset(offset);
        vehicle.addListener(listener, PositionUpdateMessage);
        vehicle.setSpeed(300, 250);

        setTimeout(() => {
            vehicle.setSpeed(0, 1500);
            vehicle.removeListener(listener);
            done();
        }, 2000);

    }

    @test @timeout(5000)"brake"(done) {
        let vehicle = VehicleTest._VEHICLE,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.speed).to.be.approximately(300, 15);
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                done();
            };

        vehicle.setSpeed(600, 200);

        setTimeout(() => {
            vehicle.brake(0.5);
            setTimeout(() => {
                vehicle.addListener(listener, PositionUpdateMessage);
            }, 2000);
        }, 2000);
    }

    @test @timeout(5000)"accelerate"(done) {
        let vehicle = VehicleTest._VEHICLE,
            listener = (msg: PositionUpdateMessage) => {
                expect(msg.speed).to.be.approximately(600, 20);
                vehicle.removeListener(listener);
                vehicle.setSpeed(0, 1500);
                done();
            };

        vehicle.accelerate(600);

        setTimeout(() => {
            vehicle.addListener(listener, PositionUpdateMessage);
        }, 3000);
    }

    @test @timeout(4000)"set green lights steady"(done) {
        this.setLightConfig([
                new LightConfig()
                    .green()
                    .steady(),
                new LightConfig()
                    .weapon()
                    .steady()
            ],
            3000, done);
    }

    @test @timeout(4000)"set red lights steady"(done) {
        this.setLightConfig([
                new LightConfig()
                    .red()
                    .steady(),
                new LightConfig()
                    .front()
                    .steady(),
                new LightConfig()
                    .tail()
                    .steady()
            ],
            2000, done);
    }

    private setLightConfig(config: Array<LightConfig>, timeout: number, done: Function): void {
        let vehicle = VehicleTest._VEHICLE;

        vehicle.setLights([
            new LightConfig()
                .blue()
                .steady(0),
            new LightConfig()
                .green()
                .steady(0),
            new LightConfig()
                .red()
                .steady(0)
        ]);

        vehicle.setLights([
            new LightConfig()
                .weapon()
                .steady(0),
            new LightConfig()
                .tail()
                .steady(0),
            new LightConfig()
                .front()
                .steady(0),
        ]);

        vehicle.setLights(config);

        setTimeout(() => {
            done();
        }, timeout);
    }
}