class Distance {

    private _distance: number;
    private _from: string;
    private _to: string;

    constructor(distance: number, from: string, to: string) {
        this._distance = distance;
        this._from = from;
        this._to = to;
    }

    get distance(): number {
        return this._distance;
    }

    get from(): string {
        return this._from;
    }

    get to(): string {
        return this._to;
    }
}

export {Distance};
