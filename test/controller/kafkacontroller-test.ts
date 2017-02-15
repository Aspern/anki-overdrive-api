import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Track} from "../../src/core/track/track-interface";
import {AnkiOverdriveTrack} from "../../src/core/track/anki-overdrive-track";
import {StraightPiece} from "../../src/core/track/straight-piece";

@suite
class KafkaControllerTest {

    @test "kafka pieces"() {
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
}