import {expect} from "chai"
import {ANKI_VEHICLE_MSG_C2V_TURN} from "../../../../lib/message/Protocol"
import {Turn, TurnTrigger, TurnType} from "../../../../lib/message/c2v/Turn"

describe("Turn", () => {

    it("has correct size", () => {
        const turn = new Turn("", 0)

        expect(turn.payload.length).to.equal(4)
    })

    it("has correct message id", () => {
        const turn = new Turn("", 0)

        expect(turn.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_TURN)
    })

    it("uses immediate trigger by default", () => {
        const turn = new Turn("", 0)

        expect(turn.trigger).to.equal(TurnTrigger.VEHICLE_TURN_TRIGGER_IMMEDIATE)
        expect(turn.payload.readUInt8(3)).to.equal(TurnTrigger.VEHICLE_TURN_TRIGGER_IMMEDIATE)
    })

    it("can use custom turn type", () => {
        const turn = new Turn("", TurnType.VEHICLE_TURN_LEFT)

        expect(turn.type).to.equal(TurnType.VEHICLE_TURN_LEFT)
        expect(turn.payload.readUInt8(2)).to.equal(TurnType.VEHICLE_TURN_LEFT)
    })

    it("can use custom turn trigger ", () => {
        const turn = new Turn("", 0, TurnTrigger.VEHICLE_TURN_TRIGGER_INTERSECTION)

        expect(turn.trigger).to.equal(TurnTrigger.VEHICLE_TURN_TRIGGER_INTERSECTION)
        expect(turn.payload.readUInt8(3)).to.equal(TurnTrigger.VEHICLE_TURN_TRIGGER_INTERSECTION)
    })

})