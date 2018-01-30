import {expect} from "chai"
import {Vehicle} from "../../../lib/vehicle/Vehicle";
import {DeviceMock} from "../../mock/DeviceMock";
import {
    ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST,
    ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE, ANKI_VEHICLE_MSG_C2V_CHANGE_LANE, ANKI_VEHICLE_MSG_C2V_PING_REQUEST,
    ANKI_VEHICLE_MSG_C2V_SDK_MODE, ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE, ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
} from "../../../lib/message/Protocol";

describe("Vehicle", () => {

    it("uses offset 0 as default", () => {
        const vehicle = new Vehicle(new DeviceMock())

        expect(vehicle.offset).to.equal(0)
    })

    it("has no name by default", () => {
        const vehicle = new Vehicle(new DeviceMock())

        expect(vehicle.name).to.be.empty
    })

    it("takes the id from ble device", () => {
        const id = "4711"
        const vehicle = new Vehicle(new DeviceMock(id))

        expect(vehicle.id).to.equal(id)
    })

    it("takes address from ble device", () => {
        const address = "47:65:d4:a9"
        const vehicle = new Vehicle(new DeviceMock("", address))

        expect(vehicle.address).to.equal(address)
    })

    describe("cancelLaneChange", () => {

        it("sends cancel lane change message", () => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.cancelLaneChange()
            const messageId = device.data.readUInt8(1)

            expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE)
        })

    })

    describe("changeLane", () => {

        it("sends lane change message with offset", () => {
            const offset = 68.0
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.changeLane(offset)
            const messageId = device.data.readUInt8(1)
            const offsetFromRoadCenter = device.data.readFloatLE(2)

            expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE)
            expect(offsetFromRoadCenter).to.approximately(offset, 0.001)
        })

    })

    describe("connect", () => {

        it("resolves self after successful connection", (done) => {
            const vehicle = new Vehicle(new DeviceMock())

            vehicle.connect().then((self) => {
                expect(self).to.equal(vehicle)
                done()
            }).catch(done)
        })

    })

    describe("disableSdkMode", () => {

        it("sends message to disable sdk mode", () => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.disableSdkMode()
            const messageId = device.data.readUInt8(1)
            const on = device.data.readUInt8(2)

            expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SDK_MODE)
            expect(on).to.equals(0) //off
        })

    })

    describe("disconnect", () => {

        it("resolves self after successful disconnect", (done) => {
            const vehicle = new Vehicle(new DeviceMock())

            vehicle.disconnect().then((self) => {
                expect(self).to.equal(vehicle)
                done()
            }).catch(done)
        })

    })

    describe("queryBatterLevel", () => {

        it("resolves battery level", (done) => {
            const batteryLevel = 3878
            const device = new DeviceMock()
            const response = Buffer.alloc(4)
            response.writeUInt8(0, 3)
            response.writeUInt8(ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE, 1)
            response.writeUInt16LE(batteryLevel, 2)
            device.registerResponse(ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST, response)
            const vehicle = new Vehicle(device)

            vehicle.queryBatterLevel().then(level => {
                expect(level).to.equals(batteryLevel)
                done()
            }).catch(done)
        })

    })

    describe("queryPing", () => {

        it("resolves ping", (done) => {
            const device = new DeviceMock()
            const response = Buffer.alloc(4)
            response.writeUInt8(0, 1)
            response.writeUInt8(ANKI_VEHICLE_MSG_V2C_PING_RESPONSE, 1)
            device.registerResponse(ANKI_VEHICLE_MSG_C2V_PING_REQUEST, response)
            const vehicle = new Vehicle(device)

            vehicle.queryPing().then(ping => {
                expect(ping).to.be.below(100)
                done()
            }).catch(done)
        })

    })

    describe("queryVersion", () => {

        it("resolves version", (done) => {
            const version = 1478
            const device = new DeviceMock()
            const response = Buffer.alloc(4)
            response.writeUInt8(0, 3)
            response.writeUInt8(ANKI_VEHICLE_MSG_V2C_PING_RESPONSE, 1)
            response.writeUInt16LE(version, 2)
            device.registerResponse(ANKI_VEHICLE_MSG_C2V_PING_REQUEST, response)
            const vehicle = new Vehicle(device)

            vehicle.queryVersion().then(ver => {
                expect(ver).to.equals(version)
                done()
            }).catch(done)
        })

    })

})