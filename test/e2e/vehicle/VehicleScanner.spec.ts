import {VehicleScanner} from "../../../lib/vehicle/VehicleScanner";
import {Bluetooth} from "../../../lib/ble/Bluetooth";
import {expect} from "chai"
import {Vehicle} from "../../../lib/vehicle/Vehicle";

const settings = require("../resources/settings.json")

describe("VehicleScanner", () => {

    describe("findAll", () => {

        it("finds all vehicles", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAll().then(vehicles => {
                expect(vehicles.length).to.equals(settings.vehicles.length)
                done()
            }).catch(done)
        }).timeout(5000)

    })

    describe("findById", () => {

        it("finds vehicle by id", (done) => {
            if(!settings.vehicles || settings.vehicles.length === 0) {
                done("Found no vehicles in settings.")
            }
            const config = settings.vehicles[0]
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findById(config.uuid).then(vehicle => {
                expect(vehicle.id).to.equals(config.uuid)
                done()
            }).catch(done)

        }).timeout(5000)

    })

    describe("findByAddress", () => {

        it("finds vehicle by address", (done) => {
            if(!settings.vehicles || settings.vehicles.length === 0) {
                done("Found no vehicles in settings.")
            }
            const config = settings.vehicles[0]
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findByAddress(config.address).then(vehicle => {
                expect(vehicle.address).to.equals(config.address)
                done()
            }).catch(done)

        }).timeout(5000)

    })

    describe("findAny", () => {

        it("finds any vehicle", (done) => {
            if(!settings.vehicles || settings.vehicles.length === 0) {
                done("Found no vehicles in settings.")
            }
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAny().then(vehicle => {
                expect(vehicle).to.instanceOf(Vehicle)
                done()
            }).catch(done)

        }).timeout(5000)

    })

})