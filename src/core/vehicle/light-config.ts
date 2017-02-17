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

/**
 * With this configuration class, the lights of a vehicle can be controlled.
 */
class LightConfig {
    private _channel: Channel;
    private _effect: Effect;
    private _start: number;
    private _end: number;
    private _cycles: number;

    /**
     * Uses the red light on top.
     *
     * @return {LightConfig} config
     */
    red(): LightConfig {
        this._channel = Channel.LIGHT_RED;
        return this;
    }

    /**
     * Uses the light on the tail.
     *
     * @return {LightConfig} config
     */
    tail(): LightConfig {
        this._channel = Channel.LIGHT_TAIL;
        return this;
    }

    /**
     * Uses the blue light on top.
     *
     * @return {LightConfig} config
     */
    blue(): LightConfig {
        this._channel = Channel.LIGHT_BLUE;
        return this;
    }

    /**
     * Uses the green light on top.
     *
     * @return {LightConfig} config
     */
    green(): LightConfig {
        this._channel = Channel.LIGHT_GREEN;
        return this;
    }

    /**
     * Uses the light in the front.
     *
     * @return {LightConfig} config
     */
    front(): LightConfig {
        this._channel = Channel.LIGHT_FRONTL;
        return this;
    }

    /**
     * Uses a special light in the front.
     *
     * @return {LightConfig} config
     */
    weapon(): LightConfig {
        this._channel = Channel.LIGHT_FRONTR;
        return this;
    }

    /**
     * The light will shine with an intensity from 0-10.
     *
     * @param intensity Brightness from 0-10
     * @return {LightConfig}
     */
    steady(intensity = 10): LightConfig {
        this.intensity(intensity)
            ._effect = Effect.EFFECT_STEADY;
        return this;
    }

    /**
     * The light will fade in the given time window.
     *
     * @param from (optional) minimal intensity
     * @param to (optional) maximal intensity
     * @param cycles (optional) cycles per 10 seconds
     * @return {LightConfig} config
     */
    fade(from = 0, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_FADE;
        return this;
    }

    /**
     * The light will throb in the given time window.
     *
     * @param from (optional) minimal intensity
     * @param to (optional) maximal intensity
     * @param cycles (optional) cycles per 10 seconds
     * @return {LightConfig} config
     */
    throb(from = 10, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_THROB;
        return this;
    }

    /**
     * The light will flash in the given time window.
     *
     * @param from (optional) minimal intensity
     * @param to (optional) maximal intensity
     * @param cycles (optional) cycles per 10 seconds
     * @return {LightConfig} config
     */
    flash(from = 10, to = 10, cycles = 10): LightConfig {
        this.fromTo(from, to)
            .setCycles(cycles)
            ._effect = Effect.EFFECT_FLASH;
        return this;
    }

    /**
     * The light will use a random effect.
     *
     * @param cycles (optional) cycles per 10 seconds
     * @return {LightConfig} config
     */
    random(cycles = 10): LightConfig {
        this.setCycles(cycles)
            ._effect = Effect.EFFECT_RANDOM;
        return this;
    }

    /**
     * Sets the intensity of the light.
     *
     * @param intensity Brightness from 0 -10.
     * @return {LightConfig} config
     */
    intensity(intensity: number): LightConfig {
        this._start = intensity;
        return this;
    }

    /**
     * Sets a time window for any time bases effect.
     *
     * @param from minimal intensity
     * @param to  maximal intensity
     * @return {LightConfig}
     */
    fromTo(from: number, to: number): LightConfig {
        this._start = from;
        this._end = to;
        return this;
    }

    /**
     * Sets cycles per 10 seconds for any time based effect.
     *
     * @param cycles  cycles per 10 seconds
     * @return {LightConfig}
     */
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