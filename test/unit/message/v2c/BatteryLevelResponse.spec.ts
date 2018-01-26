import {expect} from "chai"
import {BatteryLevelResponse} from "../../../../lib/message/v2c/BatteryLevelResponse"

describe("BatteryLevelResponse", () => {

    it("contains correct battery level", () => {
        const payload = new Buffer(4)
        const batteryLevel = 3215
        payload.writeUInt16LE(batteryLevel, 2)
        const batteryLevelResponse = new BatteryLevelResponse("", payload)

        expect(batteryLevelResponse.batteryLevel).to.equal(batteryLevel)
    })

})