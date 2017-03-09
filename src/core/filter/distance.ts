/**
 * Describes the distance between two vehicles. It contains a vertical and horizontal value. for
 * the horizontal value there is also a delta between the last two positions of a vehicle.
 */
class Distance {

    private _vehicle: string;
    private _vertical: number;
    private _horizontal: number;
    private _delta: number;

    get vehicle(): string {
        return this._vehicle;
    }

    set vehicle(value: string) {
        this._vehicle = value;
    }

    get vertical(): number {
        return this._vertical;
    }

    set vertical(value: number) {
        this._vertical = value;
    }

    get horizontal(): number {
        return this._horizontal;
    }

    set horizontal(value: number) {
        this._horizontal = value;
    }

    get delta(): number {
        return this._delta;
    }

    set delta(value: number) {
        this._delta = value;
    }
}

export {Distance};