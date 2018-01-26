import {expect} from "chai"
import {LocalizationTransitionUpdate} from "../../../../lib/message/v2c/LocalizationTransitionUpdate"

describe("LocalizationTransitionUpdate", () => {

    it("contains correct location id", () => {
        const payload = new Buffer(18)
        const roadPieceId = 42
        payload.writeUInt8(roadPieceId, 2)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.roadPieceId).to.equal(roadPieceId)
    })

    it("contains correct previous road piece id", () => {
        const payload = new Buffer(18)
        const prevRoadPieceId = 8
        payload.writeUInt8(prevRoadPieceId, 3)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.prevRoadPieceId).to.equal(prevRoadPieceId)
    })

    it("contains correct offset from road center", () => {
        const payload = new Buffer(18)
        const offsetFromRoadCenter = 47.11
        payload.writeFloatLE(offsetFromRoadCenter, 4)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.offsetFromRoadCenter).to.be.closeTo(offsetFromRoadCenter, 0.001)
    })

    it("contains correct last received lane Change command id", () => {
        const payload = new Buffer(18)
        const lastRecvLaneChangeCmdId = 0x11
        payload.writeUInt8(lastRecvLaneChangeCmdId, 8)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.lastRecvLaneChangeCmdId).to.equal(lastRecvLaneChangeCmdId)
    })

    it("contains correct last executed lane Change command id", () => {
        const payload = new Buffer(18)
        const lastExecLaneChangeCmdId = 0x12
        payload.writeUInt8(lastExecLaneChangeCmdId, 9)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.lastExecLaneChangeCmdId).to.equal(lastExecLaneChangeCmdId)
    })

    it("contains correct last desired lane change speed", () => {
        const payload = new Buffer(18)
        const lastDesiredLaneChangeSpeedMmPerSec = 480
        payload.writeUInt16LE(lastDesiredLaneChangeSpeedMmPerSec, 10)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.lastDesiredLaneChangeSpeedMmPerSec).to.equal(lastDesiredLaneChangeSpeedMmPerSec)
    })

    it("contains correct have follow line drift pixels", () => {
        const payload = new Buffer(18)
        const haveFollowLineDriftPixels = 0
        payload.writeUInt8(haveFollowLineDriftPixels, 12)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.haveFollowLineDriftPixels).to.equal(haveFollowLineDriftPixels)
    })

    it("contains correct had lane change activity", () => {
        const payload = new Buffer(18)
        const hadLaneChangeActivity = 1
        payload.writeUInt8(hadLaneChangeActivity, 13)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.hadLaneChangeActivity).to.equal(hadLaneChangeActivity)
    })

    it("contains correct uphill counter", () => {
        const payload = new Buffer(18)
        const uphillCounter = 6
        payload.writeUInt8(uphillCounter, 14)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.uphillCounter).to.equal(uphillCounter)
    })

    it("contains correct downhill counter", () => {
        const payload = new Buffer(18)
        const downhillCounter = 9
        payload.writeUInt8(downhillCounter, 15)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.downhillCounter).to.equal(downhillCounter)
    })

    it("contains correct left wheel distance", () => {
        const payload = new Buffer(18)
        const leftWheelDistCm = 2
        payload.writeUInt8(leftWheelDistCm, 16)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.leftWheelDistCm).to.equal(leftWheelDistCm)
    })

    it("contains correct right wheel distance", () => {
        const payload = new Buffer(18)
        const rightWheelDistCm = 3
        payload.writeUInt8(rightWheelDistCm, 17)
        const localizationTransitionUpdate = new LocalizationTransitionUpdate("", payload)

        expect(localizationTransitionUpdate.rightWheelDistCm).to.equal(rightWheelDistCm)
    })

})