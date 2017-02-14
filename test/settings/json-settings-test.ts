import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Settings} from "../../src/settings/settings-interface";
import {JsonSettings} from "../../src/settings/json-settings";
import {Track} from "../../src/core/track/track-interface";

@suite
class JsonSettingsTest {

    private _settings: Settings;

    constructor() {
        this._settings = new JsonSettings("resources/settings-test.json");
    }


    @test "get setting"() {
        expect(this._settings.get("key")).to.be.equals("value");
    }

    @test "get as string"() {
        expect(this._settings.getAsString("key", "default")).to.be.equals("value");
        expect(this._settings.getAsString("no-key", "default")).to.be.equals("default");
    }

    @test "get as int"() {
        expect(this._settings.getAsInt("int", 42)).to.be.equals(4711);
        expect(this._settings.getAsInt("no-key", 42)).to.be.equals(42);
        expect(this._settings.getAsInt("key", 42)).to.be.NaN;
    }

    @test "get as float"() {
        expect(this._settings.getAsFloat("float", 42.42)).to.be.equals(47.11);
        expect(this._settings.getAsFloat("no-key", 42.42)).to.be.equals(42.42);
        expect(this._settings.getAsFloat("key", 42)).to.be.NaN;
    }

    @test "get as boolean"() {
        expect(this._settings.getAsBoolean("true", false)).to.be.true;
        expect(this._settings.getAsBoolean("false", true)).to.be.false;
        expect(this._settings.getAsBoolean("no-key", true)).to.be.true;
        expect(this._settings.getAsBoolean("key", true)).to.be.false;
    }

    @test "get as date"() {
        expect(this._settings.getAsDate("date", new Date()).getTime())
            .to.be.equals(new Date("12/24/2015 18:30:30").getTime());

        expect(this._settings.getAsDate("millis", new Date()).getTime())
            .to.be.equals(new Date(1487089387439).getTime());
    }

    @test "get as track"() {
        let track: Track = this._settings.getAsTrack("track"),
            pieces = [33, 18, 23, 39, 17, 20, 34],
            i = 0;


        track.eachPiece(piece => {
            expect(piece.id).to.be.equals(pieces[i++]);
        });
    }
}