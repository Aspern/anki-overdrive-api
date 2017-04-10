class AnkiMessage {

    private _messageName: string;


    constructor(name: string) {
        this._messageName = name;
    }


    get messageName(): string {
        return this._messageName;
    }
}
export {AnkiMessage};