import {expect} from "chai"
import {VehicleScanner} from "../../../lib/vehicle/VehicleScanner";
import {BluetoothMock} from "../../mock/BluetoothMock";
import {DeviceMock} from "../../mock/DeviceMock";

describe("VehicleScanner", () => {

    it("uses default timeout of 1,5 seconds", () => {
        const mock = new BluetoothMock()
        const vehicleScanner = new VehicleScanner(mock)

        expect(vehicleScanner.timeout).to.equal(1500)
    })

    it("can use a custom timeout", () => {
        const timeout = 3000
        const mock = new BluetoothMock()
        const vehicleScanner = new VehicleScanner(mock, timeout)

        expect(vehicleScanner.timeout).to.equal(timeout)
    })

    describe("findAll", () => {

        it("finds all available vehicles", (done) => {
            const mock = new BluetoothMock([
                new DeviceMock(),
                new DeviceMock()
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findAll().then(vehicles => {
                expect(vehicles.length).to.equal(2)
                done()
            }).catch(done)
        })

        it("finds only vehicles", (done) => {
            const mock = new BluetoothMock([
                new DeviceMock("", "", ""),
                new DeviceMock("1")
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findAll().then(vehicles => {
                expect(vehicles.length).to.equal(1)
                done()
            }).catch(done)
        })

    })

})