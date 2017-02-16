/**
 * ValidationReport is used by the TrackRunner to validate the individual messages of the lanes.
 * It contains a state whether the validation was positive and data on invalid pieces and locations.
 */
class ValidationReport {

    private _valid: boolean;
    private _piece: {found: number, expected: number};
    private _location: {found: number, expected: number};
    private _message: string;

    setValid(): ValidationReport {
        this._valid = true;
        return this;
    }

    setInvalid(): ValidationReport {
        this._valid = false;
        return this;
    }

    setPiece(found: number, expected: number): ValidationReport {
        this._piece = {
            found: found,
            expected: expected
        };
        return this;
    }

    setLocation(found: number, expected: number): ValidationReport {
        this._location = {
            found: found,
            expected: expected
        };
        return this;
    }

    setMessage(message: string): ValidationReport {
        this._message = message;
        return this;
    }

    get valid(): boolean {
        return this._valid;
    }

    get piece(): {found: number; expected: number} {
        return this._piece;
    }

    get location(): {found: number; expected: number} {
        return this._location;
    }

    get message(): string {
        return this._message;
    }
}

export {ValidationReport};