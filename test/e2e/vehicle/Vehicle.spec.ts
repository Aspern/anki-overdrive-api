import {expect} from "chai"
import {Bluetooth} from "../../../lib/ble/Bluetooth";
import {VehicleScanner} from "../../../lib/vehicle/VehicleScanner";
import {Vehicle} from "../../../lib/vehicle/Vehicle";

describe("Vehicle", () => {

    describe("connect", () => {

        it("resolves self after successful connection", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
               vehicle.connect().then((self) => {
                   expect(self).to.equal(vehicle)
                   vehicle.disconnect()
                       .then(() => done())
                       .catch(done)
               }).catch(done)
           })
        }).timeout(5000)

    })

    describe("disconnect", () => {

        it("resolves self after successful disconnect", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
                vehicle.connect().then(() => {
                    vehicle.disconnect()
                        .then((self) => {
                            expect(self).to.equal(vehicle)
                            done()
                        })
                        .catch(done)
                }).catch(done)
            })
        }).timeout(5000)

    })

    describe("queryPing", () => {

        it("resolves ping", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
                vehicle.connect().then(() => {
                    vehicle.queryPing().then(ping => {
                        expect(ping).to.below(300)
                        vehicle.disconnect()
                            .then(() => done())
                            .catch(done)
                    }).catch(done)
                }).catch(done)
            })

        }).timeout(5000)

    })

    describe("queryBatteryLevel", () => {

        it("resolves batter level", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
                vehicle.connect().then(() => {
                    vehicle.queryBatterLevel().then(batteryLevel => {
                        expect(batteryLevel).within(0, 4500)
                        vehicle.disconnect()
                            .then(() => done())
                            .catch(done)
                    }).catch(done)
                }).catch(done)
            })

        }).timeout(5000)

    })

    describe("queryVersion", () => {

        it("resolves version", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
                vehicle.connect().then(() => {
                    vehicle.queryVersion().then(version => {
                        expect(version).to.be.gt(0)
                        vehicle.disconnect()
                            .then(() => done())
                            .catch(done)
                    }).catch(done)
                }).catch(done)
            })

        }).timeout(5000)

    })

})