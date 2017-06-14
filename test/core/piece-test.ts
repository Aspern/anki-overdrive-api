import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Piece} from "../../src/main/de.msg.iot.anki/core/track/piece-interface";
import {Start} from "../../src/main/de.msg.iot.anki/core/track/start";
import {Finish} from "../../src/main/de.msg.iot.anki/core/track/finish";
import {Straight} from "../../src/main/de.msg.iot.anki/core/track/straight";
import {Curve} from "../../src/main/de.msg.iot.anki/core/track/curve";

@suite
class PieceTest {

    @test "start piece correct initilaized"() {
        this.validatePiece(new Start(), Start._ID);
    }

    @test "end piece correct initilaized"() {
        this.validatePiece(new Finish(), Finish._ID);
    }

    @test "straight piece correct initilaized"() {
        this.validatePiece(new Straight(42), 42);
    }

    @test "curve piece correct initilaized"() {
        this.validatePiece(new Curve(4711), 4711);
    }

    @test "start pieces have 1 location on each lane"() {
        let start = new Start();

        start.eachLane((lane) => {
            expect(lane.length).to.be.equal(1);
        });
    }

    @test "end pieces have 2 locations on each lane"() {
        let end = new Finish();

        end.eachLane((lane) => {
            expect(lane.length).to.be.equal(2);
        });
    }

    @test "straight pieces have 3 locations on each lane"() {
        let straight = new Straight(42);

        straight.eachLane((lane) => {
            expect(lane.length).to.be.equal(3);
        });
    }

    @test "curve pieces have 3 locations outside and 2 inside"() {
        let curve = new Curve(42);

        for (let i = 0; i < 10; ++i)
            expect(curve.getLane(i).length).to.be.equal(2);

        for (let i = 10; i < 16; ++i)
            expect(curve.getLane(i).length).to.be.equal(3);
    }

    private validatePiece(piece: Piece, expectedId: number): void {
        let i = 0,
            lanes = 0;

        expect(piece.id).to.be.equal(expectedId);

        piece.eachLocation((location) => {
            expect(location).to.be.equal(i++);
        });

        piece.eachLane(() => lanes++);
        expect(lanes).to.be.equal(16);
    }

}