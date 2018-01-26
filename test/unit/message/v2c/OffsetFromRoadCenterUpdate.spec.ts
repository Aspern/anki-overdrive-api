import {expect} from "chai"
import {OffsetFromRoadCenterUpdate} from "../../../../lib/message/v2c/OffsetFromRoadCenterUpdate"

describe("LocalizationIntersectionUpdate", () => {

    it("contains correct offset from road center", () => {
        const payload = new Buffer(7)
        const offsetFromRoadCenter = 47.11
        payload.writeFloatLE(offsetFromRoadCenter, 2)
        const offsetFromRoadCenterUpdate = new OffsetFromRoadCenterUpdate("", payload)

        expect(offsetFromRoadCenterUpdate.offsetFromRoadCenter).to.be.closeTo(offsetFromRoadCenter, 0.001)
    })

    it("contains correct location id", () => {
        const payload = new Buffer(7)
        const laneChangeId = 42
        payload.writeUInt8(laneChangeId, 6)
        const offsetFromRoadCenterUpdate = new OffsetFromRoadCenterUpdate("", payload)

        expect(offsetFromRoadCenterUpdate.laneChangeId).to.equal(laneChangeId)
    })

})