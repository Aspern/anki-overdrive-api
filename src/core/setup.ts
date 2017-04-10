class Setup {

    private _ean: string;
    private _name: string;
    private _vehicles: Array<{uuid: string, address: string, name: string, offset: number}>
    private _track: {pieces: Array<{pieceId: number, type: string}>}
    private _online: boolean;

    get ean(): string {
        return this._ean;
    }

    set ean(value: string) {
        this._ean = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get vehicles(): Array<{uuid: string; address: string; name: string; offset: number}> {
        return this._vehicles;
    }

    set vehicles(value: Array<{uuid: string; address: string; name: string; offset: number}>) {
        this._vehicles = value;
    }

    get track(): {pieces: Array<{pieceId: number; type: string}>} {
        return this._track;
    }

    set track(value: {pieces: Array<{pieceId: number; type: string}>}) {
        this._track = value;
    }


    get online(): boolean {
        return this._online;
    }

    set online(value: boolean) {
        this._online = value;
    }
}

export {Setup}