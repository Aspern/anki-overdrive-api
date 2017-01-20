class ValidationReport {

    private _valid: boolean;
    private _piece: {found: number, expected: number};
    private _location: {found: number, expected: number};

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

    get valid(): boolean {
        return this._valid;
    }

    get piece(): {found: number; expected: number} {
        return this._piece;
    }

    get location(): {found: number; expected: number} {
        return this._location;
    }

}

export {ValidationReport};