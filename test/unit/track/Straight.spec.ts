import {expect} from "chai"
import {Straight} from "../../../src/track/Straight";

describe("Straight", () => {

    describe("locations", () => {

        it("has correct number of lanes", () =>  {
            const straight = new Straight(0)

            expect(straight.locations.length).to.be.equals(16)
        })

        it("has correct number of positions per lane", () => {
            const straight = new Straight(0)

            for(let i = 0; i < straight.locations.length; i++) {
                expect(straight.locations[i].length).to.equals(3, `Lane ${i} has incorrect number of positions.`)
            }
        })

        it("has correct locations", () => {
            const straight = new Straight(0)
            let expectedLocation = 0

            for(let i = 0; i < straight.locations.length; i++) {
                let lane = straight.locations[i]

                for(let j = 0; j < lane.length; j++) {
                    expect(lane[j]).to.equals(expectedLocation++, `Lane ${i} position ${j} is incorrect.`)
                }
            }
        })
    })
})