import {IPiece} from "../../../src/track/IPiece";
import {Straight} from "../../../src/track/Straight";
import {Curve} from "../../../src/track/Curve";
import {Track} from "../../../src/track/Track";
import {expect} from "chai"
import {Start} from "../../../src/track/Start";
import {Finish} from "../../../src/track/Finish";
import * as sinon from "sinon"

describe("Track", () => {

    describe("constructor", () => {

        it("creates start", () => {
            const track = new Track()
            expect(track.start).to.be.instanceof(Start)
        })

        it("creates finish", () => {
            const track = new Track()
            expect(track.finish).to.be.instanceof(Finish)
        })

        it("appends pieces to track", () => {
            const pieces: IPiece[] = [
                new Straight(1),
                new Curve(2),
                new Curve(3),
                new Straight(4),
                new Curve(5),
                new Curve(6),
            ]
            const track = new Track(pieces)
            let current = track.start.next

            for(let i = 0; current !== track.finish; i++,current = current.next) {
                expect(current.id).to.equals(pieces[i].id)
            }
        })

    })

    describe("forEach", () => {

        it("iterates pieces in order", () => {
            const pieces: IPiece[] = [
                new Straight(1),
            ]
            const track = new Track(pieces)
            const spy = sinon.spy()

            track.forEach(spy)

            expect(spy.callCount).to.equals(3)
        })

    })

    describe("getPiece", () => {

        it("returns start piece by piece id", () => {
            const track = new Track()
            const piece = track.getPiece(Start.ID)

            expect(piece).not.to.be.undefined
            expect(piece.id).to.equals(Start.ID)
        })

        it("return any piece by its id", () => {
            const pieceId = 42
            const track = new Track([
                new Straight(pieceId)
            ])
            const piece = track.getPiece(pieceId)

            expect(piece).not.to.be.undefined
            expect(piece.id).to.equals(pieceId)
        })

        it("returns undefined if no piece is found", () => {
            const track = new Track()
            const piece = track.getPiece(42)

            expect(piece).to.be.undefined
        })

    })

    describe("distance", () => {

        it("calculates distance between two positions", () => {
            const track = new Track([
                new Curve(1),
                new Curve(2),
                new Straight(3),
                new Curve(4),
                new Curve(5)
            ])
            const distance = track.distance([1,0], [3, 2])

            expect(distance).to.equals(6)
        })

        it("calculates distance within piece", () => {
            const track = new Track([
                new Straight(1)
                ])
            const distance = track.distance([1,3], [1, 5])

            expect(distance).to.equals(2)
        })

        it("calculates distnace between different lanes", () => {
            const track = new Track([
                new Curve(1),
                new Curve(2),
                new Straight(3),
                new Curve(4),
                new Curve(5)
            ])
            const distance = track.distance([33,0], [4, 22])

            expect(distance).to.equals(10)
        })

        it("calculates distance 0 if positions are the same", () => {
            const track = new Track()
            const distance = track.distance([33, 0], [33, 0])

            expect(distance).to.equals(0)
        })
    })
})
