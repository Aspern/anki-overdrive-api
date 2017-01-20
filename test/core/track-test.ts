import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Track} from "../../src/core/track/track-interface";
import {AnkiOverdriveTrack} from "../../src/core/track/anki-overdrive-track";
import {CurvePiece} from "../../src/core/track/curve-piece";
import {StraightPiece} from "../../src/core/track/straight-piece";
import {Piece} from "../../src/core/track/piece-interface";
import {EndPiece} from "../../src/core/track/end-piece";
import {StartPiece} from "../../src/core/track/start-piece";

@suite
class TrackTest {

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

        while(current !== track.end) {
            expect(current).to.be.equal(pieces[i++]);
            current = current.next;
        }
    }

}