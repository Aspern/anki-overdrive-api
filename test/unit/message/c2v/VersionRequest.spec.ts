import {expect} from "chai"
import {VersionRequest} from "../../../../lib/message/c2v/VersionRequest"
import {ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST} from "../../../../lib/message/Protocol"

describe("VersionRequest", () => {

    it("has correct size", () => {
        const versionRequest =  new VersionRequest("")

        expect(versionRequest.payload.length).to.equal(2)
    })

    it("has correct message id", () => {
        const versionRequest =  new VersionRequest("")

        expect(versionRequest.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST)
    })

})