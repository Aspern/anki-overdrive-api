import {expect} from "chai"
import {Bluetooth} from "../../../lib/ble/Bluetooth";

describe("Bluetooth", () => {

    it("is in unknown state by default", () => {
       const bluetooth = new Bluetooth()

       expect(bluetooth.state).to.equal("unknown")
    })

    it("starts scanning", (done) => {
        const bluetooth = new Bluetooth()

        bluetooth.startScanning().then(() => {
            expect(bluetooth.state).to.equal("poweredOn")
            done
        }).catch(done)

    })

})