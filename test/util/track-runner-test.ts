import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {TrackRunner} from "../../src/util/runner/track-runner";
import {PositionUpdateMessage} from "../../src/core/message/position-update-message";
import {Settings} from "../../src/settings/settings-interface";
import {JsonSettings} from "../../src/settings/json-settings";

@suite
class TrackRunnerTest {

    private _settings: Settings;
    private _laneData: Array<[number, number]> = [
        [0, -68.0],
        [8, 0.0],
        [15, 59.5]
    ];
    private _expecedLanes: Array<number> = [];


    constructor() {
        this._settings = new JsonSettings();
        this._laneData.forEach(data => {
            this._expecedLanes.push(data[0]);
        });
    }


    @test @timeout(300000)"track runner executes lanes"(done: Function) {
        let scanner = new VehicleScanner(),
            me = this,
            track = me._settings.getAsTrack("track"),
            i = 0,
            j = 0;

        scanner.findAny().then((vehicle) => {
            let runner = new TrackRunner(vehicle, track, 400, 250, true, [
                [0, -68.0],
                [8, 0.0],
                [15, 59.5]
            ]);

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
                expect(lane).to.be.equal(me._expecedLanes[i++]);
                me.validateLane(messages, lane, done);
            }).onLaneStarted((lane: number) => {
                expect(lane).to.be.equal(me._expecedLanes[j++]);
            }).run();
        }).catch(e => done(e));
    }

    private validateResult(result: Array<Array<PositionUpdateMessage>>, done: Function): void {
        let me = this;

        try {
            expect(result.length).to.equals(3);

            for (let lane = 0; lane < result.length; ++lane) {
                let messages = result[lane];
                this.validateLane(messages, me._expecedLanes[lane], done);
            }
        } catch (e) {
            done(e);
        }
    }

    private validateLane(messages: Array<PositionUpdateMessage>, lane: number, done: Function): void {
        let track = this._settings.getAsTrack("track");

        for (let i = 0; i < messages.length; ++i) {
            let message = messages[i],
                piece = track.findPiece(message.piece);
            try {
                expect(piece).not.to.be.null;
                expect(piece.getLane(lane).indexOf(message.location)).to.be.gt(-1);
            } catch (e) {
                done(e);
            }
        }
    }

}