import {expect} from "chai"
import {Finish} from "../../../src/track/Finish";

describe("Finish", () => {

    describe('constructor', () => {

        it("has has correct id", () => {
            const finish = new Finish()

            expect(finish.id).to.equals(Finish.ID)
        })
    })

    describe("locations", () => {

        it("has correct number of lanes", () =>  {
            const finish = new Finish()

            expect(finish.locations.length).to.be.equals(16)
        })

        it("has correct number of positions per lane", () => {
            const finish = new Finish()

            for(let i = 0; i < finish.locations.length; i++) {
                expect(finish.locations[i].length).to.equals(2, `Lane ${i} has incorrect number of positions.`)
            }
        })

        it("has correct locations", () => {
            const finish = new Finish()
            let expectedLocation = 0

            for(let i = 0; i < finish.locations.length; i++) {
                let lane = finish.locations[i]

                for(let j = 0; j < lane.length; j++) {
                    expect(lane[j]).to.equals(expectedLocation++, `Lane ${i} position ${j} is incorrect.`)
                }
            }
        })
    })
})