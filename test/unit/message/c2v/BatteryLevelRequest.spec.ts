import {expect} from "chai"
import {BatteryLevelRequest} from "../../../../lib/message/c2v/BatteryLevelRequest"
import {ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST} from "../../../../lib/message/Protocol";

describe("BatteryLevelRequest", () => {

    it("has correct size", () => {
        const batteryLevelRequest =  new BatteryLevelRequest("")

        expect(batteryLevelRequest.payload.length).to.equal(2)
    })

    it("has correct message id", () => {
        const batteryLevelRequest =  new BatteryLevelRequest("")

        expect(batteryLevelRequest.payload.readUInt8(1)).to.equal(ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST)
    })

})