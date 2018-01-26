import {expect} from "chai"
import {CancelLaneChange} from "../../../../lib/message/c2v/CancelLaneChange"
import {ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE} from "../../../../lib/message/Protocol"

describe("CancelLaneChange", () => {

    it("has correct size", () => {
        const cancelLaneChange =  new CancelLaneChange("")

        expect(cancelLaneChange.payload.length).to.equal(2)
    })

    it("has correct message id", () => {
        const cancelLaneChange =  new CancelLaneChange("")

        expect(cancelLaneChange.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE)
    })

})