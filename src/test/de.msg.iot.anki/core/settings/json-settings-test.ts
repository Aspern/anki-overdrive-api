import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Settings} from "../../../../main/de.msg.iot.anki/core/settings/settings-interface";
import {JsonSettings} from "../../../../main/de.msg.iot.anki/core/settings/json-settings";
import {Track} from "../../../../main/de.msg.iot.anki/core/track/track-interface";
import {SetupConfig} from "../../../../main/de.msg.iot.anki/core/settings/setup-config";

@suite
class JsonSettingsTest {

    private _settings: Settings;

    constructor() {
        this._settings = new JsonSettings("src/test/resources/test-settings.json");
    }

    @test
    get() {
        expect(this._settings.get("key")).to.be.equals("value");
    }

    @test
    getAsString() {
        expect(this._settings.getAsString("key", "default")).to.be.equals("value");
        expect(this._settings.getAsString("no-key", "default")).to.be.equals("default");
    }

    @test
    getAsInt() {
        expect(this._settings.getAsInt("int", 42)).to.be.equals(4711);
        expect(this._settings.getAsInt("no-key", 42)).to.be.equals(42);
        expect(this._settings.getAsInt("key", 42)).to.be.NaN;
    }

    @test
    getAsFloat() {
        expect(this._settings.getAsFloat("float", 42.42)).to.be.equals(47.11);
        expect(this._settings.getAsFloat("no-key", 42.42)).to.be.equals(42.42);
        expect(this._settings.getAsFloat("key", 42)).to.be.NaN;
    }

    @test
    getAsBoolean() {
        expect(this._settings.getAsBoolean("true", false)).to.be.true;
        expect(this._settings.getAsBoolean("false", true)).to.be.false;
        expect(this._settings.getAsBoolean("no-key", true)).to.be.true;
        expect(this._settings.getAsBoolean("key", true)).to.be.false;
    }

    @test
    getAsDate() {
        expect(this._settings.getAsDate("date", new Date()).getTime())
            .to.be.equals(new Date("12/24/2015 18:30:30").getTime());

        expect(this._settings.getAsDate("millis", new Date()).getTime())
            .to.be.equals(new Date(1487089387439).getTime());
    }

    @test
    getAsObject() {
        let obj: { key: string, object: { key: string } } = this._settings.getAsObject("object"),
            arr: Array<number> = this._settings.getAsObject("array");

        expect(obj.key).to.be.equals("value");
        expect(obj.object.key).to.be.equals("value");

        for (let i = 0; i < arr.length; ++i) {
            expect(arr[i]).to.be.equals(i + 1);
        }
    }

    @test
    getAsTrack() {
        let track: Track = this._settings.getAsTrack("setup.track.pieces"),
            trackConfig = this._settings.getAsSetup("setup").track,
            pieces: Array<number> = [],
            i = 0;

        trackConfig.pieces.forEach(piece => {
            pieces.push(piece.pieceId);
        });

        track.eachPiece(piece => {
            expect(piece.id).to.be.equals(pieces[i++]);
        });
    }

    @test
    getAsSetup() {
        let setup: SetupConfig = this._settings.getAsSetup("setup");

        expect(setup).not.to.be.null;
        expect(setup.vehicles.length).to.be.equals(2);
    }

}
