class Result {

    constructor(uuid: string, vehicleId: string, lane: number, avgSpeed: number, duration: number, transition?: string) {
        this._uuid = uuid;
        this._vehicleId = vehicleId;
        this._transition = transition;
        this._lane = lane;
        this._avgSpeed = avgSpeed;
        this._duration = duration;
        this._distance = avgSpeed * duration;
    }

    private _uuid: string;
    private _vehicleId: string;
    private _transition: string;
    private _lane: number;
    private _avgSpeed: number;
    private _duration: number;
    private _distance: number;


    get uuid(): string {
        return this._uuid;
    }

    set uuid(value: string) {
        this._uuid = value;
    }

    get vehicleId(): string {
        return this._vehicleId;
    }

    set vehicleId(value: string) {
        this._vehicleId = value;
    }

    get transition(): string {
        return this._transition;
    }

    set transition(value: string) {
        this._transition = value;
    }

    get lane(): number {
        return this._lane;
    }

    set lane(value: number) {
        this._lane = value;
    }

    get avgSpeed(): number {
        return this._avgSpeed;
    }

    set avgSpeed(value: number) {
        this._avgSpeed = value;
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
    }

    get distance(): number {
        return this._distance;
    }

    set distance(value: number) {
        this._distance = value;
    }
}

export {Result};