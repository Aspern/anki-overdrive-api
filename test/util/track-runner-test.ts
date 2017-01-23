import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Track} from "../../src/core/track/track-interface";
import {AnkiOverdriveTrack} from "../../src/core/track/anki-overdrive-track";
import {CurvePiece} from "../../src/core/track/curve-piece";
import {StraightPiece} from "../../src/core/track/straight-piece";
import {TrackRunner} from "../../src/util/runner/track-runner";
import {PositionUpdateMessage} from "../../src/core/message/position-update-message";

@suite
class TrackRunnerTest {

    private _track: Track = AnkiOverdriveTrack.build([
        new CurvePiece(18),
        new CurvePiece(23),
        new StraightPiece(39),
        new CurvePiece(17),
        new CurvePiece(20)
    ]);

    @test @timeout(300000)"track runner executes each line"(done: Function) {
        let scanner = new VehicleScanner(),
            me = this,
            expectedLane = 0;

        scanner.findAny().then((vehicle) => {
            let runner = new TrackRunner(vehicle, me._track);

            runner.onStop((result, e: Error) => {
                if (e)
                    done(e);

                expect(e).to.be.null;
            }).onTrackStarted(() => {
                // If necessary add expectation here.
            }).onTrackFinished((result: Array<Array<PositionUpdateMessage>>) => {
                me.validateResult(result, done);
                done();
            }).onLaneFinished((messages: Array<PositionUpdateMessage>, lane: number) => {
                expect(lane).to.be.equal(expectedLane);
                ++expectedLane;
                me.validateLane(messages, lane, done);
            }).onLaneStarted((lane: number) => {
                expect(lane).to.be.equal(expectedLane);
            }).run();
        });
    }

    private validateResult(result: Array<Array<PositionUpdateMessage>>, done: Function): void {
        try {
            expect(result.length).to.equals(16);

            for (let lane = 0; lane < result.length; ++lane) {
                let messages = result[lane];
                this.validateLane(messages, lane, done);
            }
        } catch (e) {
            done(e);
        }
    }

    private validateLane(messages: Array<PositionUpdateMessage>, lane: number, done: Function): void {
        let track = this._track;

        for (let i = 0; i < messages.length; ++i) {
                let message = messages[i],
                    piece = track.findPiece(message.id);
            try {
                expect(piece).not.to.be.null;
                expect(piece.getLane(lane).indexOf(message.location)).to.be.gt(-1);
            } catch (e) {
                console.error(piece);
                console.error("laneNumber: " + lane);
                console.error("lane: " + piece.getLane(lane));
                console.error(message);
                done(e);
            }
        }
    }

}