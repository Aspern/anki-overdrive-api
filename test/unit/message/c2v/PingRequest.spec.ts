import {expect} from "chai"
import {PingRequest} from "../../../../lib/message/c2v/PingRequest"
import {ANKI_VEHICLE_MSG_C2V_PING_REQUEST} from "../../../../lib/message/Protocol"

describe("PingRequest", () => {

    it("has correct size", () => {
        const pingRequest =  new PingRequest("")

        expect(pingRequest.payload.length).to.equal(2)
    })

    it("has correct message id", () => {
        const pingRequest =  new PingRequest("")

        expect(pingRequest.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_PING_REQUEST)
    })

})