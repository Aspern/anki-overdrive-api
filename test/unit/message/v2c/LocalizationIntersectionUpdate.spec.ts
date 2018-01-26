import {expect} from "chai"
import {LocalizationIntersectionUpdate} from "../../../../lib/message/v2c/LocalizationIntersectionUpdate"

describe("LocalizationIntersectionUpdate", () => {

    it("contains correct location id", () => {
        const payload = new Buffer(13)
        const roadPieceId = 42
        payload.writeUInt8(roadPieceId, 2)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.roadPieceId).to.equal(roadPieceId)
    })

    it("contains correct offset from road center", () => {
        const payload = new Buffer(13)
        const offsetFromRoadCenter = 47.11
        payload.writeFloatLE(offsetFromRoadCenter, 3)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.offsetFromRoadCenter).to.be.closeTo(offsetFromRoadCenter, 0.001)
    })

    it("contains correct intersection code", () => {
        const payload = new Buffer(13)
        const intersectionCode = 42
        payload.writeUInt8(intersectionCode, 7)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.intersectionCode).to.equal(intersectionCode)
    })

    it("contains correct is existing", () => {
        const payload = new Buffer(13)
        const isExisting = 1
        payload.writeUInt8(isExisting, 8)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.isExisting).to.equal(isExisting)
    })

    it("contains correct mm since last transition bar", () => {
        const payload = new Buffer(13)
        const mmSinceLastTransitionBar = 67
        payload.writeUInt16LE(mmSinceLastTransitionBar, 9)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.mmSinceLastTransitionBar).to.equal(mmSinceLastTransitionBar)
    })

    it("contains correct mm since last intersection code", () => {
        const payload = new Buffer(13)
        const mmSinceLastIntersectionCode = 13
        payload.writeUInt16LE(mmSinceLastIntersectionCode, 11)
        const localizationIntersectionUpdate = new LocalizationIntersectionUpdate("", payload)

        expect(localizationIntersectionUpdate.mmSinceLastIntersectionCode).to.equal(mmSinceLastIntersectionCode)
    })

})