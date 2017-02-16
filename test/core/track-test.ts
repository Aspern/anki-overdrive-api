import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Track} from "../../src/core/track/track-interface";
import {AnkiOverdriveTrack} from "../../src/core/track/anki-overdrive-track";
import {CurvePiece} from "../../src/core/track/curve-piece";
import {StraightPiece} from "../../src/core/track/straight-piece";
import {Piece} from "../../src/core/track/piece-interface";
import {EndPiece} from "../../src/core/track/end-piece";
import {StartPiece} from "../../src/core/track/start-piece";
import {fail} from "assert";
import {JsonSettings} from "../../src/settings/json-settings";

@suite
class TrackTest {

    @test "track finds piecs"() {
        let track: Track = AnkiOverdriveTrack.build([
            new StraightPiece(10),
            new StraightPiece(10),
            new StraightPiece(10),
            new StraightPiece(11)
        ]);

        expect(track.findPieces(10).length).to.equals(3);
        expect(track.findPieces(11).length).to.equals(1);
        expect(track.findPieces(0).length).to.equals(0);

        track.findPieces(10).forEach((piece) => {
            expect(piece.id).to.equals(10);
        });
    }

    @test "track finds single piece"() {
        let track: Track = AnkiOverdriveTrack.build([
            new StraightPiece(10),
            new StraightPiece(10),
            new StraightPiece(10),
            new StraightPiece(11)
        ]);

        expect(track.findPiece(10).id).to.equals(10);
        expect(track.findPiece(11).id).to.equals(11);
        try {
            let piece = track.findPiece(0);
            fail(piece, null, "Should not be found.", "function");
        } catch (e) {
            expect(e).not.to.be.null;
        }
    }

    @test "track has at least start and end pieces"() {
        let track = new AnkiOverdriveTrack();

        expect(track.end).instanceof(EndPiece);
        expect(track.start).instanceof(StartPiece);
    }

    @test "track builds correctly"() {
        let pieces: Array<Piece> = [
                new CurvePiece(0),
                new CurvePiece(1),
                new StraightPiece(2),
                new CurvePiece(3),
                new CurvePiece(4)
            ],
            track: Track = AnkiOverdriveTrack.build(pieces),
            current: Piece = track.start.next,
            i = 0;

        while (current !== track.end) {
            expect(current).to.be.equal(pieces[i++]);
            current = current.next;
        }
    }

    @test "track iterates lanes corrently"() {
        let pieces: Array<Piece> = [
                new CurvePiece(0),
                new CurvePiece(1),
                new StraightPiece(2),
                new CurvePiece(3),
                new CurvePiece(4)
            ],
            track: Track = AnkiOverdriveTrack.build(pieces),
            i = 0,
            j = 0;

        pieces.splice(0, 0, new StartPiece());
        pieces.push(new EndPiece());

        track.eachLaneOnPiece((piece, lane) => {
            let expectedPiece = pieces[i],
                expectedLane = expectedPiece.getLane(j);

            expect(piece.id).to.be.equal(expectedPiece.id);
            expect(lane.length).to.equals(expectedLane.length);
            for (let k = 0; k < lane.length; ++k)
                expect(lane[k]).to.equals(expectedLane[k]);

            if (i === pieces.length - 1) {
                i = 0;
                ++j;
            } else
                ++i;
        });
    }


    @test "track finds lane"() {
        let track: Track = AnkiOverdriveTrack.build([
            new CurvePiece(0),
            new CurvePiece(1),
            new StraightPiece(2),
            new CurvePiece(3),
            new CurvePiece(4)
        ]);

        expect(track.findLane(0, 0)).to.be.equals(0);
        expect(track.findLane(0, 36)).to.be.equals(15);
        expect(track.findLane(2, 2)).to.be.equals(0);
        expect(track.findLane(2, 24)).to.be.equals(8);
        expect(track.findLane(2, 45)).to.be.equals(15);

        for (let i = 0; i < 16; ++i)
            expect(track.findLane(StartPiece._ID, i)).to.be.equals(i);
    }

    @test "test"() {
        let settings = new JsonSettings(),
            track = settings.getAsTrack("track");

        track.eachTransition((t1, t2)=> {
            console.log(t1 + " => " + t2);
        }, 0, [17,0],[17,0]);
    }
}
