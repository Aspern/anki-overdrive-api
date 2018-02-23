import {expect} from "chai"
import {Bluetooth} from "../../../lib/ble/Bluetooth";

describe("Bluetooth", () => {

    it("is in unknown state by default", () => {
       const bluetooth = new Bluetooth()

       expect(bluetooth.state).to.equal("unknown")
    })

    it("uses a timeout of 1 second by default", () => {
        const bluetooth = new Bluetooth()

        expect(bluetooth.timeout).to.equal(1000)
    })

    it("can use custom timeout", () => {
        const timeout = 5000
        const bluetooth = new Bluetooth(() => {},
            () => {},
            timeout)

        expect(bluetooth.timeout).to.equal(timeout)
    })

    describe("startScanning", () => {

        it("starts scanning", (done) => {
            const bluetooth = new Bluetooth()

            bluetooth.startScanning().then(() => {
                expect(bluetooth.state).to.equal("poweredOn")
                done()
            }).catch(done)
        })

    })

    describe("stopScanning", () => {

        it("stops scanning", (done) => {
            const bluetooth = new Bluetooth()

            bluetooth.startScanning().then(() => {
                bluetooth.stopScanning().then(() => {
                    expect(bluetooth.state).to.equal("disconnected")
                    done()
                }).catch(done)
            }).catch(done)
        })

        it("doesn't stop scanning without state poweredOn", (done) => {
            const bluetooth = new Bluetooth()

            bluetooth.stopScanning().then(() => {
                expect.fail("Should not stop scanning in state unknown or offline.")
            }).catch((error) => {
                expect(error.message).to.equal("Bluetooth is still offline.")
                done()
            })

        })

    })

})