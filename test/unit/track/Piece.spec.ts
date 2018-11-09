import {Straight} from "../../../src/track/Straight";
import {expect} from "chai"
import {IPiece} from "../../../src/track/IPiece";
import {Start} from "../../../src/track/Start";
import {Curve} from "../../../src/track/Curve";

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
                for(let j = 0; j < lane.length; j++) {
                    expect(lane[j]).to.equals(expectedLocation--, `Lane ${i} position ${j} is incorrect.`)
                }
            }

        })

    })

    describe("distance", () => {

        it("calculates distance between two locations", () => {
            const piece = new Straight(42)
            const distance = piece.distance(0, 2)

            expect(distance).to.equals(2)
        })

        it("calculates distance 0 for same locations", () => {
            const piece = new Straight(42)
            const distance = piece.distance(5, 5)

            expect(distance).to.equals(0)
        })

        it("calculates distance 0 for locations on same vertical lane", () => {
            const piece = new Straight(42)
            const distance = piece.distance(0, 3)

            expect(distance).to.equals(0)
        })

        it("calculates always distance 0 on start", () => {
            const piece = new Start()
            const distance = piece.distance(0, 1)

            expect(distance).to.equals(0)
        })

        it("calculates distance between inner and outer curve", () => {
            const piece = new Curve(42)
            const distance = piece.distance(0, 22)

            expect(distance).to.equals(2)
        })

        it("throws error for invalid locations ", () => {
            const piece = new Start()

            expect(piece.distance.bind(piece, 0, 42)).to.throw("Location with id [42] does not exist.")
        })

    })

    describe("getFirstLocationId", () => {

        it("returns first location id for lane index", () => {
            const piece = new Start()

            for(let index = 0; index < 16; index++) {
                expect(piece.getFirstLocationId(index)).to.equals(index)
            }
        })

        it("throws error if index is out of bound", () => {
            const piece = new Start()

            expect(piece.getFirstLocationId.bind(piece, 42)).to.throw("Index [42] is out of bound.")
        })

    })
})
