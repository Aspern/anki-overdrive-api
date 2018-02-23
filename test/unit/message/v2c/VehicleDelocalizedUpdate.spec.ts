import {expect} from "chai"
import {VehicleDelocalizedUpdate} from "../../../../lib/message/v2c/VehicleDelocalizedUpdate"

describe("VehicleDelocalizedUpdate", () => {

    it("can be created", () => {
        const vehicleDelocalizedUpdate =  new VehicleDelocalizedUpdate("", Buffer.alloc(2))

        expect(vehicleDelocalizedUpdate).not.to.be.null
    })

})