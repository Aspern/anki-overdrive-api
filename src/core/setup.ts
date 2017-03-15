class Setup {

    private _uuid: string;
    private _vehicles: Array<{uuid: string, address: string, name: string}>
    private _track: {pieces: Array<{pieceId: number, type: string}>}

    get uuid(): string {
        return this._uuid;
    }

    set uuid(value: string) {
        this._uuid = value;
    }

    get vehicles(): Array<{uuid: string; address: string; name: string}> {
        return this._vehicles;
    }

    set vehicles(value: Array<{uuid: string; address: string; name: string}>) {
        this._vehicles = value;
    }

    get track(): {pieces: Array<{pieceId: number; type: string}>} {
        return this._track;
    }

    set track(value: {pieces: Array<{pieceId: number; type: string}>}) {
        this._track = value;
    }
}

export {Setup}