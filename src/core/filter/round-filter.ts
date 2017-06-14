import {ActiveFilter} from "./active-filter";
import {Track} from "../track/track-interface";
import {Vehicle} from "../vehicle/vehicle-interface";
import {RoundUpdateMessage} from "../message/v2c/round-update-message";
import {PositionUpdateMessage} from "../message/v2c/position-update-message";
import {LabeledPositionUpdateMessage} from "../message/v2c/labeled-position-update-message";
import {Start} from "../track/start";
import {LabeledSetSpeed} from "../message/c2v/labeled-set-speed";
import {VehicleMessage} from "../message/vehicle-message";
import {SetSpeed} from "../message/c2v/set-speed";
import {isNullOrUndefined} from "util";

class RoundFilter implements ActiveFilter<[Track, Vehicle], RoundUpdateMessage> {

    private _track: Track;
    private _vehicle: Vehicle;
    private _started = false;
    private _listener: (output: RoundUpdateMessage) => any = () => {
    };
    private _vehicleListener: (message: PositionUpdateMessage) => any;
    private _currentPositionMessages: Array<LabeledPositionUpdateMessage> = [];
    private _currentSetSpeeds: Array<SetSpeed> = [];
    private _roundCounter = 0;
    private _lastPositionUpdate: PositionUpdateMessage;

    init(input: [Track, Vehicle]): void {
        this._track = input[0];
        this._vehicle = input[1];
    }

    start(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            try {
                if (me._started === true)
                    reject(new Error("Filter has already been started."));
                else {
                    me._started = true;
                    me.registerVehicleListener();
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    stop(): Promise<void> {
        let me = this;

        return new Promise<void>((resolve, reject) => {
            try {
                if (me._started === false)
                    reject(new Error("Filter is not running."));
                else {
                    me._started = false;
                    me.unregisterVehicleListener();
                    resolve();
                }

            } catch (e) {
                reject(e);
            }
        });
    }

    onUpdate(listener: (output: RoundUpdateMessage) => any): void {
        if (!this._started)
            this._listener = listener;
    }

    private registerVehicleListener(): void {
        let me = this;

        me._vehicleListener = (message: VehicleMessage) => {
            if (message instanceof PositionUpdateMessage) {
                me.addMessageToRound(message);
                me._lastPositionUpdate = message;
            } else if (message instanceof SetSpeed) {
                me._currentSetSpeeds.push(message);
            }

        };

        me._vehicle.addListener(me._vehicleListener);
    }

    private unregisterVehicleListener(): void {
        this._vehicle.removeListener(this._vehicleListener);
    }

    private addMessageToRound(message: PositionUpdateMessage): void {
        let me = this;

        if (message.piece === Start._ID
            && me._currentPositionMessages.length > 0) {
            me._listener(me.createRoundUpdateMessage());
            me._currentPositionMessages = [];
        }

        me._currentPositionMessages.push(
            new LabeledPositionUpdateMessage(message.data, me._vehicle)
        );
    }

    private createRoundUpdateMessage(): RoundUpdateMessage {
        let me = this,
            currentMessage = me._currentPositionMessages,
            lane = me._track.findLane(currentMessage[0].piece, currentMessage[0].location),
            i = 0,
            missing = 0,
            total: number;

        me._track.eachTransition(t => {
            let message = currentMessage[i];

            if (!isNullOrUndefined(message)) {
                if (message.piece === t[0] && message.location === t[1]) {
                    i++;
                } else {
                    currentMessage.splice(i++, 0, me.buildMissingPositionUpdateMessage(
                        t[1],
                        t[0],
                        message.offset || 0,
                        message.speed || 0,
                        message.lastDesiredSpeed || 0
                    ));
                }
            }
        }, lane);

        total = currentMessage.length;
        currentMessage.forEach(message => {
            if (message.missing)
                missing++;
        });

        let quality = missing > 0 ? 1 - (missing / total) : 1;

        let roundUpdate = new RoundUpdateMessage(
            me._vehicle,
            me._roundCounter++,
            quality,
            currentMessage,
            quality >= 0.85 ? 50 : 0
        );

        return roundUpdate;
    }

    private buildMissingPositionUpdateMessage(location: number, piece: number, offset: number, speed: number, lastDesiredSpeed: number): LabeledPositionUpdateMessage {
        let buffer = new Buffer(17);
        buffer.writeUInt8(16, 0);
        buffer.writeUInt8(0x27, 1);
        buffer.writeUInt8(location, 2);
        buffer.writeUInt8(piece, 3);
        buffer.writeFloatLE(offset, 4);
        buffer.writeInt16LE(speed, 8);
        buffer.writeUInt8(0, 10);
        buffer.writeUInt8(0, 11);
        buffer.writeUInt8(0, 12);
        buffer.writeInt16LE(0, 13);
        buffer.writeInt16LE(lastDesiredSpeed, 15);

        return new LabeledPositionUpdateMessage(buffer, this._vehicle, true);
    }
}

export {RoundFilter};