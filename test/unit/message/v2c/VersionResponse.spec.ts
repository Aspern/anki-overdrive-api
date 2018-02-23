import {expect} from "chai"
import {VersionResponse} from "../../../../lib/message/v2c/VersionResponse"

describe("VersionResponse", () => {

    it("contains correct version", () => {
        const payload = Buffer.alloc(4)
        const version = 4711
        payload.writeUInt16LE(version, 2)
        const versionResponse = new VersionResponse("", payload)

        expect(versionResponse.version).to.equal(version)
    })

})