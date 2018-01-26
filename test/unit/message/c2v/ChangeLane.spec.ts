import {expect} from "chai"
import {ChangeLane} from "../../../../lib/message/c2v/ChangeLane"
import {ANKI_VEHICLE_MSG_C2V_CHANGE_LANE} from "../../../../lib/message/Protocol"

describe("SetOffsetFromRoadCenter", () => {

    it("has correct size", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.payload.length).to.equal(12)
    })

    it("has correct message id", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE)
    })

    it("can change offset from road center", () => {
        const offsetFromRoadCenterMm = 47.11
        const changeLane = new ChangeLane("", offsetFromRoadCenterMm)

        expect(changeLane.offsetFromRoadCenterMm).to.closeTo(offsetFromRoadCenterMm, 0.001)
        expect(changeLane.payload.readFloatLE(6)).to.closeTo(offsetFromRoadCenterMm, 0.001)
    })

    it("uses horizontal speed of 300 by default", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.horizontalSpeedMmPerSec).to.equal(300)
        expect(changeLane.payload.readUInt16LE(2)).to.equal(300)
    })

    it("uses horizontal acceleration of 300 by default", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.horizontalAccelMmPerSec2).to.equal(300)
        expect(changeLane.payload.readUInt16LE(4)).to.equal(300)
    })

    it("uses no hop intent by default", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.hopIntent).to.equal(0x0)
        expect(changeLane.payload.readUInt8(10)).to.equal(0x0)
    })

    it("uses no tag by default", () => {
        const changeLane = new ChangeLane("", 0)

        expect(changeLane.tag).to.equal(0x0)
        expect(changeLane.payload.readUInt8(11)).to.equal(0x0)
    })

    it("can use custom horizontal speed", () => {
        const horizontalSpedMmPerSec = 500
        const changeLane = new ChangeLane("", 0,horizontalSpedMmPerSec)

        expect(changeLane.horizontalSpeedMmPerSec).to.equal(horizontalSpedMmPerSec)
        expect(changeLane.payload.readUInt16LE(2)).to.equal(horizontalSpedMmPerSec)
    })

    it("can use custom horizontal acceleration", () => {
        const horizontalAccelMmPerSec2 = 111
        const changeLane = new ChangeLane("", 0, 0,horizontalAccelMmPerSec2)

        expect(changeLane.horizontalAccelMmPerSec2).to.equal(horizontalAccelMmPerSec2)
        expect(changeLane.payload.readUInt16LE(4)).to.equal(horizontalAccelMmPerSec2)
    })

    it("can use custom hop intent", () => {
        const hopIntent = 0x2
        const changeLane = new ChangeLane("", 0, 0,0, hopIntent)

        expect(changeLane.hopIntent).to.equal(hopIntent)
        expect(changeLane.payload.readUInt8(10)).to.equal(hopIntent)
    })

    it("can use custom tag", () => {
        const tag = 0x42
        const changeLane = new ChangeLane("", 0, 0, 0, 0x0, tag)

        expect(changeLane.tag).to.equal(tag)
        expect(changeLane.payload.readUInt8(11)).to.equal(tag)
    })

})