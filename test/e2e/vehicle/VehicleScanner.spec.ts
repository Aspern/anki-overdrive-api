import {VehicleScanner} from "../../../lib/vehicle/VehicleScanner";
import {Bluetooth} from "../../../lib/ble/Bluetooth";
import {expect} from "chai"

const settings = require("../resources/settings.json")

describe("VehicleScanner", () => {

    beforeEach((done) => {
        setTimeout(() => {
            done()
        }, 1500)
    })


    describe("findAll", () => {

        it("finds all vehicles", (done) => {
            const bluetooth = new Bluetooth()
            const scanner = new VehicleScanner(bluetooth)

            scanner.findAll().then(vehicles => {
                expect(vehicles.length).to.equals(settings.vehicles.length)
                done()
            }).catch(done)
        }).timeout(5000)

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

})