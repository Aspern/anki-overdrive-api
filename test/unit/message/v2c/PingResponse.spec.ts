import {expect} from "chai"
import {PingRequest} from "../../../../lib/message/c2v/PingRequest"
import {PingResponse} from "../../../../lib/message/v2c/PingResponse"

describe("PingResponse", () => {

    it("calculates Ping", (done) => {
        const timeout = 300
        const tolerance = 50
        const pingRequest = new PingRequest("")
        const payload = Buffer.alloc(2)

        setTimeout(() => {
            const pingResponse = new PingResponse("", payload)

            expect(pingResponse.calculatePing(pingRequest)).to.be.closeTo(timeout, tolerance)
            done()
        }, timeout)
    })

})