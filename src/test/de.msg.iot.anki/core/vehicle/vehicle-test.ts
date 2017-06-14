import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {Vehicle} from "../../../../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {JsonSettings} from "../../../../main/de.msg.iot.anki/core/settings/json-settings";
import {VehicleScannerImpl} from "../../../../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-impl";
import {PositionUpdateMessage} from "../../../../core/message/v2c/position-update-message";
import {Settings} from "../../../../main/de.msg.iot.anki/core/settings/settings-interface";
import {VehicleConfig} from "../../../../main/de.msg.iot.anki/core/settings/vehicle-config";
import {getClassExtendsHeritageClauseElement} from "typedoc/dist/lib/ts-internal";

@suite
class VehicleTest {

    static VEHICLE: Vehicle;
    static CONFIG: VehicleConfig;

    @timeout(5000)
    static before(done: Function) {
        let settings = new JsonSettings("src/test/resources/test-settings.json"),
            setup = settings.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup);


        scanner.findAny()
            .then(vehicle => {
                VehicleTest.VEHICLE = vehicle;
                done();

                setup.vehicles.forEach(config => {
                    if (config.uuid === vehicle.id)
                        VehicleTest.CONFIG = config;
                });
            })
            .catch(console.error);
    }

    @test
    @timeout(2000)
    connect(done: Function) {
        let vehicle = VehicleTest.VEHICLE;

        vehicle.connect()
            .then(() => {
                expect(vehicle.connected).to.be.true;
                vehicle.disconnect()
                    .then(() => setTimeout(() => done(), 500))
                    .catch(error => done(error));
            }).catch(error => done(error));
    }

    @test
    @timeout(2000)
    disconnect(done: Function) {
        let vehicle = VehicleTest.VEHICLE;

        vehicle.connect()
            .then(() => {
                vehicle.disconnect()
                    .then(() => {
                        expect(vehicle.connected).to.be.false;
                        setTimeout(() => done(), 500);
                    })
                    .catch(error => done(error));
            }).catch(error => done(error));
    }

    @test
    @timeout(10000)
    setSpeed(done: Function) {
        let vehicle = VehicleTest.VEHICLE,
            speed = 500;

        vehicle.connect()
            .then(() => {
                vehicle.setSpeed(speed, 1500);
                setTimeout(() => {
                    vehicle.addListener((message: PositionUpdateMessage) => {
                        expect(message.speed).to.be.approximately(speed, 50);
                    }, PositionUpdateMessage);
                }, 5000);
                setTimeout(() => {
                    vehicle.setSpeed(0, 1500);
                    setTimeout(() => {
                        vehicle.disconnect()
                            .then(() => setTimeout(() => done(), 500))
                            .catch(error => done(error));
                    }, 500);
                }, 7000);
            })
            .catch(error => done(error));
    }

    @test
    setOffset() {
        let vehicle = VehicleTest.VEHICLE,
            offset = VehicleTest.CONFIG.offset;

        vehicle.setOffset(offset);
    }

    @test
    @timeout(10000)
    changeLane(done: Function) {
        let vehicle = VehicleTest.VEHICLE,
            offset = VehicleTest.CONFIG.offset,
            nextOffset = offset * -1;

        vehicle.connect()
            .then(() => {

                vehicle.setSpeed(500, 1500);

                setTimeout(() => {
                    vehicle.changeLane(nextOffset);
                }, 3000);

                setTimeout(() => {
                    vehicle.addListener((message: PositionUpdateMessage) => {
                        expect(message.offset).to.be.approximately(nextOffset, 2);
                    }, PositionUpdateMessage);
                }, 6000);

                setTimeout(() => {
                    vehicle.setSpeed(0, 1500);
                    setTimeout(() => {
                        vehicle.disconnect()
                            .then(() => setTimeout(() => done(), 500))
                            .catch(error => done(error));
                    }, 500);
                }, 8000);

            }).catch(error => done(error));
    }

    @test
    cancelLaneChange() {

    }

    @test
    turnLeft() {

    }

    @test
    turnRight() {

    }

    @test
    uTurn() {

    }

    @test
    uTurnJump() {

    }

    @test
    setSdkMode() {

    }


    @test
    queryPing() {

    }

    @test
    queryVersion() {


    }

    @test
    queryBatteryLevel() {

    }

    @test
    addListener() {

    }

    @test
    removeListener() {

    }

    @test
    setLights() {

    }

    @test
    brake() {
    }

    @test
    accelerate() {
    }

}