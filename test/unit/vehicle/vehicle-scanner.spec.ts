import {expect} from "chai"
import {AnkiOverdriveVehicleScanner} from "../../../lib/vehicle/anki-overdrive-vehicle-scanner"

describe("VehicleScanner", () => {

    it("has a default timeout of 1000 ms", () => {
        const scanner = new AnkiOverdriveVehicleScanner()

        expect(scanner.timeout).to.equal(1000)
    })

    it("uses 3 retries by default", () => {
        const scanner = new AnkiOverdriveVehicleScanner()

        expect(scanner.retries).to.equal(3)
    })

    it("can initialize with custom timeout", () => {
        const scanner = new AnkiOverdriveVehicleScanner(5000)

        expect(scanner.timeout).to.equal(5000)
    })

    it("can initialize with custom retries", () => {
        const scanner = new AnkiOverdriveVehicleScanner(1000, 5)

        expect(scanner.retries).to.equal(5)
    })

})