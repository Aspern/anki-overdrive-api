import {expect} from "chai"
import {ANKI_VEHICLE_MSG_C2V_SET_SPEED} from "../../../../lib/message/Protocol"
import {SetSpeed} from "../../../../lib/message/c2v/SetSpeed"

describe("SetSpeed", () => {

    it("has correct size", () => {
        const setSpeed = new SetSpeed("", 0)

        expect(setSpeed.payload.length).to.equal(7)
    })

    it("has correct message id", () => {
        const setSpeed = new SetSpeed("", 0)

        expect(setSpeed.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_SET_SPEED)
    })

    it("uses acceleration of 500 by default", () => {
        const setSpeed = new SetSpeed("", 0)

        expect(setSpeed.accelMmPerSec2).to.equal(500)
        expect(setSpeed.payload.readUInt16LE(4)).to.equal(500)
    })

    it("does not respect road piece speed limit by default", () => {
        const setSpeed = new SetSpeed("", 0)

        expect(setSpeed.respectRoadPieceSpeedLimit).to.be.false
        expect(setSpeed.payload.readUInt8(6)).to.equal(0)
    })

    it("can have custom speed", () => {
        const speed = 300
        const setSpeed = new SetSpeed("", speed)

        expect(setSpeed.speedMmPerSec).to.equal(speed)
        expect(setSpeed.payload.readUInt16LE(2)).to.equal(speed)
    })

    it("can have custom acceleration", () => {
        const acceleration = 355
        const setSpeed = new SetSpeed("", 0, acceleration)

        expect(setSpeed.accelMmPerSec2).to.equal(acceleration)
        expect(setSpeed.payload.readUInt16LE(4)).to.equal(acceleration)
    })

    it("can respect the road piece speed limit", () => {
        const respectSpeedLimit = true
        const setSpeed = new SetSpeed("", 0, 0, respectSpeedLimit)

        expect(setSpeed.respectRoadPieceSpeedLimit).to.be.true
        expect(setSpeed.payload.readUInt8(6)).to.equal(1)
    })

})