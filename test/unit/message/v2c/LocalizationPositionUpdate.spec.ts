import {expect} from "chai"
import {LocalizationPositionUpdate} from "../../../../lib/message/v2c/LocalizationPositionUpdate"

describe("LocalizationPositionUpdate", () => {

    it("contains correct location id", () => {
        const payload = Buffer.alloc(17)
        const location = 42
        payload.writeUInt8(location, 2)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.locationId).to.equal(location)
    })

    it("contains correct road piece id", () => {
        const payload = Buffer.alloc(17)
        const roadPieceId = 42
        payload.writeUInt8(roadPieceId, 3)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.roadPieceId).to.equal(roadPieceId)
    })

    it("contains correct offset from road center", () => {
        const payload = Buffer.alloc(17)
        const offsetFromRoadCenter = 47.11
        payload.writeFloatLE(offsetFromRoadCenter, 4)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.offsetFromRoadCenter).to.be.closeTo(offsetFromRoadCenter, 0.001)
    })

    it("contains correct speed", () => {
        const payload = Buffer.alloc(17)
        const speedMmPerSec = 502
        payload.writeUInt16LE(speedMmPerSec, 8)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.speedMmPerSec).to.equal(speedMmPerSec)
    })

    it("contains correct parsing flags", () => {
        const payload = Buffer.alloc(17)
        const parsingFlags = 0x42
        payload.writeUInt8(parsingFlags, 10)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.parsingFlags).to.equal(parsingFlags)
    })

    it("contains correct last received lane Change command id", () => {
        const payload = Buffer.alloc(17)
        const lastRecvLaneChangeCmdId = 0x11
        payload.writeUInt8(lastRecvLaneChangeCmdId, 11)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.lastRecvLaneChangeCmdId).to.equal(lastRecvLaneChangeCmdId)
    })

    it("contains correct last executed lane Change command id", () => {
        const payload = Buffer.alloc(17)
        const lastExecLaneChangeCmdId = 0x12
        payload.writeUInt8(lastExecLaneChangeCmdId, 12)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.lastExecLaneChangeCmdId).to.equal(lastExecLaneChangeCmdId)
    })

    it("contains correct last desired lane change speed", () => {
        const payload = Buffer.alloc(17)
        const lastDesiredLaneChangeSpeedMmPerSec = 480
        payload.writeUInt16LE(lastDesiredLaneChangeSpeedMmPerSec, 13)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.lastDesiredLaneChangeSpeedMmPerSec).to.equal(lastDesiredLaneChangeSpeedMmPerSec)
    })

    it("contains correct last desired speed", () => {
        const payload = Buffer.alloc(17)
        const lastDesiredSpeedMmPerSec = 480
        payload.writeUInt16LE(lastDesiredSpeedMmPerSec, 15)
        const localizationPositionUpdate = new LocalizationPositionUpdate("", payload)

        expect(localizationPositionUpdate.lastDesiredSpeedMmPerSec).to.equal(lastDesiredSpeedMmPerSec)
    })

})