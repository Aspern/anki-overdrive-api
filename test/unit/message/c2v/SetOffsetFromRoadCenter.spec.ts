import {expect} from "chai"
import {SetOffsetFromRoadCenter} from "../../../../lib/message/c2v/SetOffsetFromRoadCenter"
import {ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER} from "../../../../lib/message/Protocol"

describe("SetOffsetFromRoadCenter", () => {

    it("has correct size", () => {
        const setOffsetFromRoadCenter = new SetOffsetFromRoadCenter("", 0)

        expect(setOffsetFromRoadCenter.payload.length).to.equal(6)
    })

    it("has correct message id", () => {
        const setOffsetFromRoadCenter = new SetOffsetFromRoadCenter("", 0)

        expect(setOffsetFromRoadCenter.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER)
    })

    it("can change offset from road center", () => {
        const offsetMm = 47.11
        const setOffsetFromRoadCenter = new SetOffsetFromRoadCenter("", offsetMm)

        expect(setOffsetFromRoadCenter.offsetMm).to.closeTo(offsetMm, 0.001)
        expect(setOffsetFromRoadCenter.payload.readFloatLE(2)).to.closeTo(offsetMm, 0.001)
    })

})