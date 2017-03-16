class Setup {

    private _uuid: string;
    private _vehicles: Array<{uuid: string, address: string, name: string}>
    private _track: {pieces: Array<{pieceId: number, type: string}>}
    private _online: boolean;
    private _offset: number;

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


    get online(): boolean {
        return this._online;
    }

    set online(value: boolean) {
        this._online = value;
    }

    get offset(): number {
        return this._offset;
    }

    set offset(value: number) {
        this._offset = value;
    }
}

export {Setup}