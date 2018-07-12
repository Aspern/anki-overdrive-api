import {expect} from "chai"
import {Straight} from "../../../src/track/Straight";
import {Curve} from "../../../src/track/Curve";

describe("Curve", () => {

    describe("locations", () => {

        it("has correct number of lanes", () =>  {
            const curve = new Curve(0)

            expect(curve.locations.length).to.be.equals(16)
        })

        it("has correct number of positions per lane", () => {
            const curve = new Curve(0)

            for(let i = 0; i < curve.locations.length; i++) {
                if(i < 10) {
                    expect(curve.locations[i].length).to.equals(2, `Lane ${i} has incorrect number of positions.`)
                } else {
                    expect(curve.locations[i].length).to.equals(3, `Lane ${i} has incorrect number of positions.`)
                }
            }
        })

        it("has correct locations", () => {
            const curve = new Curve(0)
            let expectedLocation = 0

            for(let i = 0; i < curve.locations.length; i++) {
                let lane = curve.locations[i]

                for(let j = 0; j < lane.length; j++) {
                    expect(lane[j]).to.equals(expectedLocation++, `Lane ${i} position ${j} is incorrect.`)
                }
            }
        })
    })
})