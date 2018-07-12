import {Straight} from "../../../src/track/Straight";
import {expect} from "chai"
import {IPiece} from "../../../src/track/IPiece";

describe("Piece", () => {

    describe("reverse", () => {

        it("is not reversed by default", () => {
            const piece: IPiece = new Straight(0)

            expect(piece.reversed).to.be.false
        })

        it("has state reversed after reversing", () => {
            const piece: IPiece = new Straight(0)

            piece.reverse()

            expect(piece.reversed).to.be.true
        })

        it("reverses location matrix", () => {
            const piece: IPiece = new Straight(0)
            let expectedLocation = 47

            piece.reverse()

            for(let i = 0; i < piece.locations.length; i++) {
                const lane = piece.locations[i]
                for(let j= 0; j < lane.length; j++) {
                    expect(lane[j]).to.equals(expectedLocation--, `Lane ${i} position ${j} is incorrect.`)
                }
            }

        })

    })

})