class Distance {
    private _vehicle: string;
    private _vertical: number;
    private _horizontal: number;


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
}

export {Distance};