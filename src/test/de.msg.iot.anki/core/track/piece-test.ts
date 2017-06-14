import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Straight} from "../../../../main/de.msg.iot.anki/core/track/straight";

@suite
class PieceTest {

    @test
    getLane() {
        let piece = new Straight(0);

        for (let i = 0; i < 16; i++)
            expect(piece.getLane(i).length).to.be.equals(3);
    }

    @test
    getLocation() {
        let piece = new Straight(0),
            location = 0;

        for (let i = 0; i < 16; i++)
            for (let j = 0; j < 3; j++)
                expect(piece.getLocation(i, j)).to.be.equals(location++);
    }

    @test
    getLocationIndex() {
        let piece = new Straight(0);
        
        for (let lane = 0; lane < 16; lane++)
            piece.eachLocationOnLane(lane, location => {
                expect(piece.getLocationIndex(lane, location) >= 0).to.be.true;
                expect(piece.getLocationIndex(lane, location) < 3).to.be.true;
            });
    }

    @test
    eachLane() {
        let piece = new Straight(0),
            location = 0;

        piece.eachLane(lane => {
            expect(lane.length).to.be.equals(3);
        });
    }

    @test
    eachLocation() {
        let piece = new Straight(0),
            location = 0;

        piece.eachLocation(loc => {
            expect(loc).to.be.equals(location++);
        });
    }

    @test
    eachLocationOnLane() {
        let piece = new Straight(0),
            location = 0;

        for (let lane = 0; lane < 16; lane++)
            piece.eachLocationOnLane(lane, loc => {
                expect(loc).to.be.equals(location++);
            });
    }
}