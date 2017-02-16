import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {Track} from "../../core/track/track-interface";
import {PositionUpdateMessage} from "../../core/message/position-update-message";
import {StartPiece} from "../../core/track/start-piece";
import {ValidationReport} from "./validation-report";

/**
 * TrackRunner is a helper class that automates driving a vehicle on a certain set of lines.
 * Various event handlers can be used during the process to access the data of the individual lines
 * or the entire set-up. The TrackRunner can also validate if all data has been collected within
 * a line.
 */
class TrackRunner {

    private _laneFinishedHandler: (messages: Array<PositionUpdateMessage>, lane: number) => any = () => {
    };
    private _laneStartedHandler: (lane: number) => any = () => {
    };
    private _trackStartedHandler: () => any = () => {
    };
    private _trackFinishedHandler: (messages: Array<Array<PositionUpdateMessage>>) => any = () => {
    };
    private _invalidLaneHandler: (messages: Array<PositionUpdateMessage>, report: ValidationReport) => any = (messages, report) => {
        console.error(report);
    };
    private _timeoutHandler: () => any = () => {
        console.log("Found no lane after " + this._timeout + "ms.");
    };
    private _stopHandler: (messages: Array<Array<PositionUpdateMessage>>, e?: Error) => any = () => {
    };
    private _validator = (messages: Array<PositionUpdateMessage>, track: Track, lane: number) => {
        let report = new ValidationReport().setValid(),
            i = 0;

        track.eachPiece((piece) => {
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
    };

    private _vehicle: Vehicle;
    private _track: Track;
    private _running = false;
    private _result: Array<Array<PositionUpdateMessage>> = [];
    private _speed: number;
    private _acceleration: number;
    private _laneData: Array<[number, number]>;
    private _validate: boolean;
    private _timeout = 60000 // one minute.


    /**
     * Creates a new TrackRunner instance with following parameters.
     *
     * @param vehicle Vehicle to be used
     * @param track Track on which the vehicle is to be driven
     * @param speed (optional) Speed with which the vehicle is to drive (default is 400mm/sec)
     * @param acceleration (optional) Acceleration for the vehicle (default is 250mm/sec²)
     * @param validate (optional) Enables validation for the messages (default is true)
     * @param laneData (optional) Set of lanes that should be used (default is all lanes)
     */
    constructor(vehicle: Vehicle, track: Track, speed = 400, acceleration = 250, validate = true, laneData: Array<[number, number]> = [
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
    ]) {
        this._vehicle = vehicle;
        this._track = track;
        this._speed = speed;
        this._acceleration = acceleration;
        this._laneData = laneData;
        this._validate = validate;
    }


    /**
     * Handler which is triggered as soon as the vehicle stops driving. The handler is also
     * triggered if the vehicle is stopped by an error.
     *
     * @param handler The handler function
     * @param hander.messages All messages before the car has been stopped.
     * @return {TrackRunner}
     */
    onStop(handler: (messages: Array<Array<PositionUpdateMessage>>, e: Error) => any): TrackRunner {
        this._stopHandler = handler;
        return this;
    }

    /**
     * Handler which is triggered as soon as the vehicle starts to drive.
     *
     * @param handler The handler function
     * @return {TrackRunner}
     */
    onTrackStarted(handler: () => any): TrackRunner {
        this._trackStartedHandler = handler;
        return this;
    }

    /**
     * Handler which is triggered as soon as the vehicle has traveled all the lines correctly.
     *
     * @param handler The handler function
     * @param handler.messages Messages for each lane
     * @return {TrackRunner}
     */
    onTrackFinished(handler: (messages: Array<Array<PositionUpdateMessage>>) => any): TrackRunner {
        this._trackFinishedHandler = handler;
        return this;
    }

    /**
     * Handler which is triggered as soon as the vehicle has traced a line.
     *
     * @param handler The handler function
     * @param handler.messages Messages for this lane
     * @return {TrackRunner}
     */
    onLaneFinished(handler: (messages: Array<PositionUpdateMessage>, lane: number) => any): TrackRunner {
        this._laneFinishedHandler = handler;
        return this;
    }

    /**
     * Handler which is triggered as soon as the vehicle starts to drive on a line.
     *
     * @param handler The handler function
     * @return {TrackRunner}
     */
    onLaneStarted(handler: (lane: number) => any): TrackRunner {
        this._laneStartedHandler = handler;
        return this;
    }

    /**
     * Handler which is trigger as soon as a lane is reported as invalid.
     *
     * @param handler The handler function
     * @return {TrackRunner}
     */
    onInvalidLaneHandler(handler: (messages: Array<PositionUpdateMessage>, report: ValidationReport) => any): TrackRunner {
        this._invalidLaneHandler = handler;
        return this;
    }

    /**
     * Handler which is trigger if lane searching reaches a timeout.
     *
     * @param handler The handler function
     * @return {TrackRunner}
     */
    onTimeoutHandler(handler: () => any): TrackRunner {
        this._timeoutHandler = handler;
        return this;
    }

    /**
     * Registers an own validation function for lane validation. A validator can only be registered
     * before using the 'run' method.
     *
     * @param validator Validation function
     * @return {TrackRunner}
     */
    setValidator(validator: (messages: Array<PositionUpdateMessage>, track: Track, lane: number) => ValidationReport): TrackRunner {
        if (!this._running)
            this._validator = validator;
        return this;
    }

    /**
     * Starts the vehicle and runs all specified lines.
     */
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
            me.stop(e);
        });
    }

    /**
     * Stop the vehicle and cancel the TrackRunner. If an internal call is made,
     * the error is indicated with.
     *
     * @param e (optional) Error if an internal call is made
     */
    stop(e?: Error): void {
        let me = this;

        if (e)
            console.error(e);

        if (me._running) {
            me._vehicle.setSpeed(0, 200);
            setTimeout(() => {
                me._vehicle.disconnect().then(() => {
                    me._stopHandler(me._result, e);
                });
            }, 3000);
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
            timeout = setTimeout(() => me._timeoutHandler(), me._timeout);


        return new Promise<PositionUpdateMessage>((resolve) => {
            let listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location;

                if (attempts >= 3) {
                    clearTimeout(timeout);
                    vehicle.removeListener(listener);
                    me.stop(new Error("Unable to find lane [" + lane + "]."));
                }

                if (piece === StartPiece._ID) {
                    if (location === startLocation) {
                        clearTimeout(timeout);
                        vehicle.removeListener(listener);
                        resolve(message);
                    } else if (location < startLocation || location > startLocation) {
                        ++attempts;
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
            messages: Array<PositionUpdateMessage> = [startMessage],
            timeout = setTimeout(() => me._timeoutHandler(), me._timeout);


        return new Promise<Array<PositionUpdateMessage>>((resolve) => {
            let listener = (message: PositionUpdateMessage) => {
                let piece = message.piece,
                    location = message.location;

                if (messages.length > 1 && piece === startMessage.piece && location === startMessage.location) {
                    messages.push(message);
                    if (me._validate) {
                        let report = me._validator(messages, me._track, lane);
                        if (report.valid) {
                            clearTimeout(timeout);
                            vehicle.removeListener(listener);
                            resolve(messages);
                        } else {
                            me._invalidLaneHandler(messages, report);
                            messages = [message];
                        }
                    } else {
                        clearTimeout(timeout);
                        vehicle.removeListener(listener);
                        resolve(messages);
                    }
                } else
                    messages.push(message);
            };

            vehicle.addListener(listener, PositionUpdateMessage);
        });
    }

}

export {TrackRunner}