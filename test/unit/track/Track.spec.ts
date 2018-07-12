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
            const track = new Track([])
            expect(track.start).to.be.instanceof(Start)
        })

        it("creates finish", () => {
            const track = new Track([])
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

})