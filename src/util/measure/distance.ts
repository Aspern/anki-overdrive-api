class Distance {

    constructor(vehicleId: string, lane: number, avgSpeed: number, duration: number, transition?: [[number, number], [number, number]]) {
        this._vehicleId = vehicleId;
        this._transition = transition;
        this._lane = lane;
        this._avgSpeed = avgSpeed;
        this._duration = duration;
        this._distance = avgSpeed * duration;
    }

    private _vehicleId: string;
    private _transition: [[number, number], [number, number]];
    private _lane: number;
    private _avgSpeed: number;
    private _duration: number;
    private _distance: number;


    get vehicleId(): string {
        return this._vehicleId;
    }

    get transition():[[number, number], [number, number]] {
        return this._transition;
    }

    get lane(): number {
        return this._lane;
    }

    get avgSpeed(): number {
        return this._avgSpeed;
    }

    get duration(): number {
        return this._duration;
    }

    get distance(): number {
        return this._distance;
    }
}

export {Distance};