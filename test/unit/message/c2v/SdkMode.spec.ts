import {expect} from "chai"
import {SdkMode} from "../../../../lib/message/c2v/SdkMode"
import {
    ANKI_VEHICLE_MSG_C2V_SDK_MODE,
    ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION
} from "../../../../lib/message/Protocol"

describe("SdkMode", () => {

    it("has correct size", () => {
        const sdkMode = new SdkMode("")

        expect(sdkMode.payload.length).to.equal(4)
    })

    it("has correct message id", () => {
        const sdkMode = new SdkMode("")

        expect(sdkMode.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_SDK_MODE)
    })

    it("enables sdk mode by default", () => {
        const sdkMode = new SdkMode("")

        expect(sdkMode.on).to.be.true
        expect(sdkMode.payload.readUInt8(2)).to.equal(1)
    })

    it("uses override localization flag by default", () => {
        const sdkMode = new SdkMode("")

        expect(sdkMode.flags).to.equal(ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION)
        expect(sdkMode.payload.readUInt8(3)).to.equal(ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION)
    })

    it("can deactivate sdk mode", () => {
        const sdkMode = new SdkMode("", false)

        expect(sdkMode.on).to.be.false
        expect(sdkMode.payload.readUInt8(2)).to.equal(0)
    })

    it("can use custom flags", () => {
        const sdkMode = new SdkMode("", true, 0x15)

        expect(sdkMode.flags).to.equal(0x15)
        expect(sdkMode.payload.readUInt8(3)).to.equal(0x15)
    })

})