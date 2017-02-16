import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Piece} from "../../src/core/track/piece-interface";
import {StartPiece} from "../../src/core/track/start-piece";
import {EndPiece} from "../../src/core/track/end-piece";
import {StraightPiece} from "../../src/core/track/straight-piece";
import {CurvePiece} from "../../src/core/track/curve-piece";


class PieceTest {

    @test "start piece correct initilaized"() {
        this.validatePiece(new StartPiece(), StartPiece._ID);
    }

    @test "end piece correct initilaized"() {
        this.validatePiece(new EndPiece(), EndPiece._ID);
    }

    @test "straight piece correct initilaized"() {
        this.validatePiece(new StraightPiece(42), 42);
    }

    @test "curve piece correct initilaized"() {
        this.validatePiece(new CurvePiece(4711), 4711);
    }

    @test "start pieces have 1 location on each lane"() {
        let start = new StartPiece();

        start.eachLane((lane) => {
            expect(lane.length).to.be.equal(1);
        });
    }

    @test "end pieces have 2 locations on each lane"() {
        let end = new EndPiece();

        end.eachLane((lane) => {
            expect(lane.length).to.be.equal(2);
        });
    }

    @test "straight pieces have 3 locations on each lane"() {
        let straight = new StraightPiece(42);

        straight.eachLane((lane) => {
            expect(lane.length).to.be.equal(3);
        });
    }

    @test "curve pieces have 3 locations outside and 2 inside"() {
        let curve = new CurvePiece(42);

        for (let i = 0; i < 10; ++i)
            expect(curve.getLane(i).length).to.be.equal(2);

        for (let i = 10; i < 16; ++i)
            expect(curve.getLane(i).length).to.be.equal(3);
    }

    /**
     * Validates if the piece has the correct id, sequence of locations and number of lanes.
     *
     * @param piece Piece to validate.
     * @param expectedId Expected id for piece.
     */
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