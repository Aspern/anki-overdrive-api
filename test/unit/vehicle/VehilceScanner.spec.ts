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

    it("can initialize with a custom timeout", () => {
        const timeout = 3000
        const mock = new BluetoothMock()
        const vehicleScanner = new VehicleScanner(mock, timeout)

        expect(vehicleScanner.timeout).to.equal(timeout)
    })

    it("can set timeout", () => {
        const timeout = 3000
        const mock = new BluetoothMock()
        const vehicleScanner = new VehicleScanner(mock, 0)

        vehicleScanner.timeout = timeout
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

    })

    describe("findById", () => {

        it("finds a vehicle by its id", (done) => {
            const id = "4711"
            const mock = new BluetoothMock([
                new DeviceMock(id)
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findById(id)
                .then(vehicle => {
                    expect(vehicle.id).to.equal(id)
                    done()
                }).catch(done)
        })

        it("returns undefined if no vehicle is found by id", (done) => {
            const mock = new BluetoothMock()
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findById("4711")
                .then(vehicle => {
                    expect(vehicle).to.be.undefined
                    done()
                }).catch(done)
        })

        it("returns the first vehicle with a matching id", (done) => {
            const id = "4711"
            const mock = new BluetoothMock([
                new DeviceMock(id, "1"),
                new DeviceMock(id, "2")
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findById("4711")
                .then(vehicle => {
                    expect(vehicle.address).to.equal("1")
                    done()
                }).catch(done)
        })

    })

    describe("findByAddress", () => {

        it("finds a vehicle by its address", (done) => {
            const address = "4711"
            const mock = new BluetoothMock([
                new DeviceMock("1", address)
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findByAddress(address)
                .then(vehicle => {
                    expect(vehicle.address).to.equal(address)
                    done()
                }).catch(done)
        })

        it("returns undefined if no vehicle is found by address", (done) => {
            const mock = new BluetoothMock()
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findByAddress("4711")
                .then(vehicle => {
                    expect(vehicle).to.be.undefined
                    done()
                }).catch(done)
        })

        it("returns the first vehicle with a matching address", (done) => {
            const address = "4711"
            const mock = new BluetoothMock([
                new DeviceMock("1", address),
                new DeviceMock("2", address)
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findByAddress("4711")
                .then(vehicle => {
                    expect(vehicle.id).to.equal("1")
                    done()
                }).catch(done)
        })
    })

    describe("findAny", () => {

        it("finds any vehicle", (done) => {
            const mock = new BluetoothMock([
                new DeviceMock(),
                new DeviceMock()
            ])
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findAny()
                .then(vehicle => {
                    expect(vehicle).not.to.be.undefined
                    expect(vehicle).not.to.be.null
                    done()
                }).catch(done)
        })

        it("returns undefined if no vehicle is available", (done) => {
            const mock = new BluetoothMock()
            const vehicleScanner = new VehicleScanner(mock, 0)

            vehicleScanner.findAny()
                .then(vehicle => {
                    expect(vehicle).to.be.undefined
                    done()
                }).catch(done)
        })

    })

    describe("onError", () => {

        it("can register a custom error handler", (done) => {
            const mock = new BluetoothMock()
            const vehicleScanner = new VehicleScanner(mock, 0)
            const customError = new Error()

            vehicleScanner.onError((error => {
                expect(error).to.equal(customError)
                done()
            }))
            mock.throwError(customError)
        })

    })

})