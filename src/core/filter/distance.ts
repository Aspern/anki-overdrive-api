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