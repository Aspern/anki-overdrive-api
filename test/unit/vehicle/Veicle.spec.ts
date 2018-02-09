import {expect} from "chai"
import {Vehicle} from "../../../lib/vehicle/Vehicle";
import {DeviceMock} from "../../mock/DeviceMock";
import {
    ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST,
    ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE, ANKI_VEHICLE_MSG_C2V_CHANGE_LANE, ANKI_VEHICLE_MSG_C2V_PING_REQUEST,
    ANKI_VEHICLE_MSG_C2V_SDK_MODE, ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER, ANKI_VEHICLE_MSG_C2V_SET_SPEED,
    ANKI_VEHICLE_MSG_C2V_TURN,
    ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST, ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_PING_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE, TurnType
} from "../../../lib/message/Protocol";
import {LocalizationPositionUpdate} from "../../../lib/message/v2c/LocalizationPositionUpdate";
import {SetSpeed} from "../../../lib/message/c2v/SetSpeed";
import * as sinon from "sinon"

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

    it("sends timeout if no response is received after 1500ms", (done) => {
        const device = new DeviceMock()
        const vehicle = new Vehicle(device)

        vehicle.connect().then(() => {
            vehicle.queryPing().then(() => {
                done(new Error("Should not be received."))
            }).catch(error => {
                expect(error.message).to.contain("timeout")
                done()
            })
            device.disconnect()
                .catch(done)
        }).catch(done)
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

        it("sends message to change lane", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0)
                const messageId = device.data.readUInt8(1)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE)
                done()
            }).catch(done)
        })

        it("sends message with custom offset", (done) => {
            const offset = 68.0
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(offset)
                const offsetFromRoadCenter = device.data.readFloatLE(6)

                expect(offsetFromRoadCenter).to.approximately(offset, 0.001)
                done()
            }).catch(done)
        })

        it("sends message with custom speed", (done) => {
            const speed = 500
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0, speed)
                const receivedSpeed = device.data.readUInt16LE(2)

                expect(speed).to.equals(receivedSpeed)
                done()
            }).catch(done)
        })

        it("uses a default speed of 300 mm/sec", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0)
                const speed = device.data.readUInt16LE(2)

                expect(speed).to.equals(300)
                done()
            }).catch(done)
        })

        it("sends message with custom acceleration", (done) => {
            const acceleration = 450
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0, 0, acceleration)
                const receivedAcceleration = device.data.readUInt16LE(4)

                expect(receivedAcceleration).to.equals(acceleration)
                done()
            }).catch(done)
        })

        it("uses a default acceleration of 300 mm/sec²", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0)
                const accleration = device.data.readUInt16LE(4)

                expect(accleration).to.equals(300)
                done()
            }).catch(done)
        })

        it("sends message with custom hop Intent", (done) => {
            const hopIntent = 0x42
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0, 0, 0, hopIntent)
                const receivedHopIntent = device.data.readUInt8(10)

                expect(receivedHopIntent).to.equals(hopIntent)
                done()
            }).catch(done)
        })

        it("uses no hop intent by default", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0)
                const hopIntent = device.data.readUInt8(10)

                expect(hopIntent).to.equals(0x0)
                done()
            }).catch(done)
        })

        it("sends message with custom tag", (done) => {
            const tag = 0x2
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0, 0, 0, 0, tag)
                const receivedTag = device.data.readUInt8(11)

                expect(receivedTag).to.equals(tag)
                done()
            }).catch(done)
        })

        it("uses no tag by default", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.changeLane(0)
                const tag = device.data.readUInt8(11)

                expect(tag).to.equals(0x0)
                done()
            }).catch(done)
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
            expect(on).to.equals(0)
        })

        it("disables sdk mode before disconnecting", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.disconnect().then(() => {
                const messageId = device.data.readUInt8(1)
                const enabled = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SDK_MODE)
                expect(enabled).to.equals(0)
                done()
            }).catch(done)
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

    describe("enableSdkMode", () => {

        it("sends message to enable sdk mode", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.enableSdkMode()
                const messageId = device.data.readUInt8(1)
                const enabled = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SDK_MODE)
                expect(enabled).to.equals(1)
                done()
            }).catch(done)
        })

        it("enables sdk mode after connecting", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                const messageId = device.data.readUInt8(1)
                const enabled = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SDK_MODE)
                expect(enabled).to.equals(1)
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

            vehicle.connect().then(() => {
                vehicle.queryBatterLevel().then(level => {
                    expect(device.data.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST)
                    expect(level).to.equals(batteryLevel)
                    done()
                }).catch(done)
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

            vehicle.connect().then(() => {
                vehicle.queryPing().then(ping => {
                    expect(ping).to.be.below(100)
                    done()
                }).catch(done)
            }).catch(done)
        })

    })

    describe("queryVersion", () => {

        it("resolves version", (done) => {
            const version = 1478
            const device = new DeviceMock()
            const response = Buffer.alloc(4)
            response.writeUInt8(0, 3)
            response.writeUInt8(ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE, 1)
            response.writeUInt16LE(version, 2)
            device.registerResponse(ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST, response)
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.queryVersion().then(ver => {
                    expect(ver).to.equals(version)
                    done()
                }).catch(done)
            }).catch(done)
        })

    })

    describe("setOffset", () => {

        it("sends message to change offset", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setOffset(0)
                const messageId = device.data.readUInt8(1)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER)
                done()
            }).catch(done)
        })

        it("sends message with custom offset", (done) => {
            const offset = 42.5
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setOffset(offset)
                const offsetFromRoadCenter = device.data.readFloatLE(2)

                expect(offsetFromRoadCenter).to.approximately(offset, 0.001)
                done()
            }).catch(done)
        })

        it("sets internal offset", (done) => {
            const offset = 42.5
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setOffset(offset)

                expect(vehicle.offset).to.approximately(offset, 0.001)
                done()
            }).catch(done)
        })

    })

    describe("setSpeed", () => {

        it("sends message to set speed", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(0)
                const messageId = device.data.readUInt8(1)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_SET_SPEED)
                done()
            }).catch(done)
        })

        it("sends message with custom speed", (done) => {
            const speed = 350
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(speed)
                const receivedSpeed = device.data.readUInt16LE(2)

                expect(receivedSpeed).to.equals(speed)
                done()
            }).catch(done)
        })

        it("sends message with custom acceleration", (done) => {
            const acceleration = 150
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(0, acceleration)
                const receivedAcceleration = device.data.readUInt16LE(4)

                expect(receivedAcceleration).to.equals(acceleration)
                done()
            }).catch(done)
        })

        it("uses a default acceleration of 500mm/sec²", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(0)
                const receivedAcceleration = device.data.readUInt16LE(4)

                expect(receivedAcceleration).to.equals(500)
                done()
            }).catch(done)
        })

        it("sends message with custom road piece speed limit", (done) => {
            const limit = true
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(0, 0, limit)
                const receivedLimit = device.data.readUInt8(6)

                expect(receivedLimit).to.equals(1)
                done()
            }).catch(done)
        })

        it("uses no road piece speed limit by default", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.setSpeed(0)
                const receivedLimit = device.data.readUInt8(6)

                expect(receivedLimit).to.equals(0)
                done()
            }).catch(done)
        })

    })

    describe("turnLeft", () => {

        it("sends message to turn left", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.turnLeft()
                const messageId = device.data.readUInt8(1)
                const type = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_TURN)
                expect(type).to.equals(TurnType.VEHICLE_TURN_LEFT)
                done()
            }).catch(done)
        })
    })

    describe("turnRight", () => {

        it("sends message to turn right", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.turnRight()
                const messageId = device.data.readUInt8(1)
                const type = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_TURN)
                expect(type).to.equals(TurnType.VEHICLE_TURN_RIGHT)
                done()
            }).catch(done)
        })

    })

    describe("uTurn", () => {

        it("sends message for u-turn", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.uTurn()
                const messageId = device.data.readUInt8(1)
                const type = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_TURN)
                expect(type).to.equals(TurnType.VEHICLE_TURN_UTURN)
                done()
            }).catch(done)
        })
    })

    describe("uTurnJump", () => {

        it("sends message for u-turn with jump", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                vehicle.uTurnJump()
                const messageId = device.data.readUInt8(1)
                const type = device.data.readUInt8(2)

                expect(messageId).to.equals(ANKI_VEHICLE_MSG_C2V_TURN)
                expect(type).to.equals(TurnType.VEHICLE_TURN_UTURN_JUMP)
                done()
            }).catch(done)
        })
    })

    describe("addListener", () => {

        it("can listen on messages from vehicle", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)
            const locationId = 1
            const roadPieceId = 3
            const message = Buffer.alloc(18)
            message.writeUInt8(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE, 1)
            message.writeUInt8(locationId, 2)
            message.writeUInt8(locationId, 2)
            message.writeUInt8(roadPieceId, 3)

            vehicle.connect().then(() => {
                const listener = (message: LocalizationPositionUpdate) => {
                    expect(message).is.instanceOf(LocalizationPositionUpdate)
                    expect(message.locationId).to.equals(locationId)
                    expect(message.roadPieceId).to.equals(roadPieceId)
                    done()
                }
                vehicle.addListener(listener)
                device.triggerRead(message)
            }).catch(done)

        })

        it("can listen on messages send to vehicle", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)
            const speed = 300

            vehicle.connect().then(() => {
                const listener = (message: SetSpeed) => {
                    expect(message).is.instanceOf(SetSpeed)
                    expect(message.speedMmPerSec).to.equals(speed)
                    done()
                }
                vehicle.addListener(listener)
                vehicle.setSpeed(speed)
            }).catch(done)

        })

    })

    describe("removeListener", () => {

        it("can remove listener", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                const spy = sinon.spy()

                vehicle.addListener(spy)
                vehicle.removeListener(spy)
                vehicle.setSpeed(0)

                setTimeout(() => {
                    expect(spy.calledOnce).to.be.false
                    done()
                }, 100)
            }).catch(done)
        })

        it("removes all listeners after disconnecting", (done) => {
            const device = new DeviceMock()
            const vehicle = new Vehicle(device)

            vehicle.connect().then(() => {
                const spy = sinon.spy()

                vehicle.addListener(spy)
                vehicle.disconnect().then(() => {
                    vehicle.setSpeed(0)
                    expect(spy.calledOnce).to.be.false
                    done()
                }).catch(done)
            }).catch(done)
        })

    })

})