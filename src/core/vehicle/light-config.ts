enum Channel {
    LIGHT_RED,
    LIGHT_TAIL,
    LIGHT_BLUE,
    LIGHT_GREEN,
    LIGHT_FRONTL,
    LIGHT_FRONTR
}

enum Effect {
    EFFECT_STEADY,
    EFFECT_FADE,
    EFFECT_THROB,
    EFFECT_FLASH,
    EFFECT_RANDOM
}

class LightConfig {
    private _channel: Channel;
    private _effect: Effect;
    private _start: number;
    private _end: number;
    private _cycles: number;

    red(): LightConfig {
        this._channel = Channel.LIGHT_RED;
        return this;
    }

    tail(): LightConfig {
        this._channel = Channel.LIGHT_TAIL;
        return this;
    }

    blue(): LightConfig {
        this._channel = Channel.LIGHT_BLUE;
        return this;
    }

    green(): LightConfig {
        this._channel = Channel.LIGHT_GREEN;
        return this;
    }

    front(): LightConfig {
        this._channel = Channel.LIGHT_FRONTL;
        return this;
    }

    weapon(): LightConfig {
        this._channel = Channel.LIGHT_FRONTR;
        return this;
    }

    steady(intensity = 10): LightConfig {
        this.intensity(intensity)
            ._effect = Effect.EFFECT_STEADY;
        return this;
    }

    fade(from = 0, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_FADE;
        return this;
    }

    throb(from = 10, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_THROB;
        return this;
    }

    flash(from = 10, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_FLASH;
        return this;
    }

    random(cycles = 10): LightConfig {
        this.setCycles(cycles)
            ._effect = Effect.EFFECT_RANDOM;
        return this;
    }

    intensity(intensity: number): LightConfig {
        this._start = intensity;
        return this;
    }

    fromTo(from: number, to: number): LightConfig {
        this._start = from;
        this._end = to;
        return this;
    }

    setCycles(cycles: number): LightConfig {
        this._cycles = cycles;
        return this;
    }

    get channel(): Channel {
        return this._channel;
    }

    get effect(): Effect {
        return this._effect;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }

    get cycles(): number {
        return this._cycles;
    }
}

export {LightConfig};