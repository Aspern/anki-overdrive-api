class Setup {

    private _ean: string;
    private _uuid: string;
    private _vehicles: Array<{uuid: string, address: string, name: string, offset: number,connected:boolean}>
    private _track: {pieces: Array<{pieceId: number, type: string}>}
    private _online: boolean;
    private _websocket: string

    get ean(): string {
        return this._ean;
    }

    set ean(ean: string) {
        this._ean = ean;
    }

    get uuid(): string {
        return this._uuid;
    }

    set uuid(uuid: string) {
        this._uuid = uuid;
    }

    get vehicles(): Array<{uuid: string; address: string; name: string; offset: number,connected:boolean}> {
        return this._vehicles;
    }

    set vehicles(value: Array<{uuid: string; address: string; name: string; offset: number,connected:boolean}>) {
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

    get websocket(): string {
        return this._websocket;
    }

    set websocket(value: string) {
        this._websocket = value;
    }
}

export {Setup}