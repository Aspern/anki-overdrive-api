import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Track} from "../../core/track/track-interface";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {StartPiece} from "../../core/track/start-piece";
import {ValidationReport} from "../measure/validation-report";

class TrackRunner {

    private _laneFinishedHandler: (messages: Array<PositionUpdateMessage>, lane: number) => any = () => {
    };
    private _laneStartedHandler: (lane: number) => any = () => {
    };
    private _trackStartedHandler: () => any = () => {
    };
    private _trackFinishedHandler: (messages: Array<Array<PositionUpdateMessage>>) => any = () => {
    };
    private _stopHandler: (messages: Array<Array<PositionUpdateMessage>>, e?: Error) => any = () => {
    };

    private _vehicle: Vehicle;
    private _track: Track;
    private _running = false;
    private _result: Array<Array<PositionUpdateMessage>> = [];
    private _speed: number;
    private _acceleration: number;
    private _laneData: Array<[number, number]> = [
        [0, -68.0],
        [1, -59.5],
        [2, -51.0],
        [3, -42.5],
        [4, -34.0],
        [5, -25.5],
        [6, -17.0],
        [7, -8.5],
        [8, 0.0],
        [9, 8.5],
        [10, 17.0],
        [11, 25.5],
        [12, 34.0],
        [13, 42.5],
        [14, 51.0],
        [15, 59.5]
    ];

    constructor(vehicle: Vehicle, track: Track, speed = 400, acceleration = 250) {
        this._vehicle = vehicle;
        this._track = track;
        this._speed = speed;
        this._acceleration = acceleration;
    }


    onStop(handler: (messages: Array<Array<PositionUpdateMessage>>, e: Error) => any): TrackRunner {
        this._stopHandler = handler;
        return this;
    }

    onTrackStarted(handler: () => any): TrackRunner {
        this._trackStartedHandler = handler;
        return this;
    }

    onTrackFinished(handler: (messages: Array<Array<PositionUpdateMessage>>) => any): TrackRunner {
        this._trackFinishedHandler = handler;
        return this;
    }

    onLaneFinished(handler: (messages: Array<PositionUpdateMessage>, lane: number) => any): TrackRunner {
        this._laneFinishedHandler = handler;
        return this;
    }

    onLaneStarted(handler: (lane: number) => any): TrackRunner {
        this._laneStartedHandler = handler;
        return this;
    }

    run(): void {
        let me = this;

        me._vehicle.connect().then(() => {
            me._running = true;
            me._vehicle.setSpeed(me._speed, me._acceleration);
            me._trackStartedHandler();
            me._laneData.reduce((promise, data) => {
                let lane = data[0],
                    offset = data[1];

                return promise.then((result: Array<Array<PositionUpdateMessage>>) => {
                    return me.driveOnLane(lane, offset).then((messages: Array<PositionUpdateMessage>) => {
                        result.push(messages);
                        return result;
                    });
                });
            }, Promise.resolve(me._result)).then(() => {
                me.stop();
                me._trackFinishedHandler(me._result);
            });
        }).catch((e) => {
            throw new Error("Unable to run TrackRunner: " + e.message);
        });
    }

    stop(e?: Error): void {
        let me = this;

        if (e)
            console.error(e);

        if (me._running) {
            me._vehicle.setSpeed(0, 1500);
            me._vehicle.disconnect().then(() => {
                me._stopHandler(me._result, e);
            });
        }
    }

    private driveOnLane(lane: number, offset: number): Promise<Array<PositionUpdateMessage>> {
        let me = this;

        return new Promise<Array<PositionUpdateMessage>>((resolve) => {
            me.findLane(lane, offset).then((message) => {
                me._laneStartedHandler(lane);
                me.collectMessagesForLane(message, lane).then((messages: Array<PositionUpdateMessage>) => {
                    me._laneFinishedHandler(messages, lane);
                    resolve(messages);
                });
            });
        });
    }

    private findLane(lane: number, offset: number): Promise<PositionUpdateMessage> {
        let me = this,
            vehicle = me._vehicle,
            startLocation = me._track.start.getLocation(lane, 0),
            attempts = 0,
            correcting = false;


        return new Promise<PositionUpdateMessage>((resolve) => {
            let listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location;

                if (attempts >= 3)
                    me.stop(new Error("Unable to find lane [" + lane + "]."));

                if (piece === StartPiece._ID) {
                    if (location === startLocation) {
                        vehicle.removeListener(listener);


                        resolve(message);
                    } else if (location < startLocation || location > startLocation && !correcting) {

                        vehicle.setOffset(message.offset);
                        correcting = true;
                        setTimeout(() => {
                            vehicle.changeLane(offset);
                            ++attempts;
                            correcting = false;
                        });
                    }
                }
            };

            vehicle.changeLane(offset);
            setTimeout(() => vehicle.addListener(listener, PositionUpdateMessage), 1500);
        });
    }

    private collectMessagesForLane(startMessage: PositionUpdateMessage, lane: number): Promise<Array<PositionUpdateMessage>> {
        let me = this,
            vehicle = me._vehicle,
            messages: Array<PositionUpdateMessage> = [startMessage];


        return new Promise<Array<PositionUpdateMessage>>((resolve) => {
            let listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location;

                if (messages.length > 1 && piece === startMessage.piece && location === startMessage.location) {
                    messages.push(message);
                    let report = me.validateMessages(messages, lane);
                    if (report.valid) {
                        vehicle.removeListener(listener);
                        resolve(messages);
                    } else {
                        console.error(report);
                        messages = [message];
                    }
                } else
                    messages.push(message);
            };

            vehicle.addListener(listener, PositionUpdateMessage);
        });
    }

    private validateMessages(messages: Array<PositionUpdateMessage>, lane: number): ValidationReport {
        let report = new ValidationReport().setValid(),
            i = 0;

        this._track.eachPiece((piece) => {
            let foundPiece = messages[i] ? messages[i].piece : undefined,
                expectedPiece = piece.id;

            if (foundPiece !== expectedPiece)
                report.setInvalid()
                    .setPiece(foundPiece, expectedPiece);

            piece.eachLocationOnLane(lane, (location) => {
                let foundLocation = messages[i] ? messages[i].location : undefined,
                    expectedLocation = location;

                if (foundLocation !== expectedLocation)
                    report.setInvalid()
                        .setPiece(foundPiece, expectedPiece)
                        .setLocation(foundLocation, expectedLocation);
                ++i;
            });
        });

        return report;
    }
}

export {TrackRunner}