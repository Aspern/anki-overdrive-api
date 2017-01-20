import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Vehicle} from "../../src/core/vehicle/vehicle-interface";
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
                me.validateResult(result);
                done();
            }).onLaneFinished((messages: Array<PositionUpdateMessage>, lane: number) => {
                expect(lane).to.be.equal(expectedLane);
                ++expectedLane;
                me.validateLane(messages);
            }).onLaneStarted((lane: number) => {
                expect(lane).to.be.equal(expectedLane);
            }).run();
        });
    }

    private validateResult(result: Array<Array<PositionUpdateMessage>>): void {
        console.log(result);
    }

    private validateLane(messages: Array<PositionUpdateMessage>): void {

    }

}