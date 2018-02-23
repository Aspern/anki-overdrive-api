import {expect} from "chai"
import {BatteryLevelRequest} from "../../../../lib/message/c2v/BatteryLevelRequest"

describe("BatteryLevelRequest", () => {

    it("can be created", () => {
        const batteryLevelRequest =  new BatteryLevelRequest("")

        expect(batteryLevelRequest).not.to.be.null
    })

})