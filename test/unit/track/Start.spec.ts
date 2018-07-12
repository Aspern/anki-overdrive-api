import {expect} from "chai"
import {Start} from "../../../src/track/Start";

describe("Start", () => {

    describe('constructor', () => {

        it("has has correct id", () => {
           const start = new Start()

            expect(start.id).to.equals(Start.ID)
        })

    })

    describe("locations", () => {

        it("has correct number of lanes", () =>  {
            const start = new Start()

            expect(start.locations.length).to.be.equals(16)
        })

        it("has correct number of positions per lane", () => {
            const start = new Start()

            for(let i = 0; i < start.locations.length; i++) {
                expect(start.locations[i].length).to.equals(1, `Lane ${i} has incorrect number of positions.`)
            }
        })

       it("has correct locations", () => {
           const start = new Start()
           let expectedLocation = 0

           for(let i = 0; i < start.locations.length; i++) {
               let lane = start.locations[i]

               for(let j = 0; j < lane.length; j++) {
                   expect(lane[j]).to.equals(expectedLocation++, `Lane ${i} position ${j} is incorrect.`)
               }
           }

       })


    })



})