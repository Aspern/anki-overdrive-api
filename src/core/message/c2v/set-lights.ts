import {VehicleMessage} from "../vehicle-message";
import {LightConfig} from "../../vehicle/light-config";

class SetLights extends VehicleMessage {

    constructor(vehicleId: string, config: LightConfig|Array<LightConfig>) {
        super(new Buffer(18), vehicleId, 0x33, 17);
        let channelCount = 1,
            pos = 2;

        if (config instanceof Array)
            channelCount = config.length > 3 ? 3 : config.length;
        else
            config = [config];

        this.data.writeUInt8(channelCount, pos++);
        this.writeLightConfig(pos, config);

    }

    private writeLightConfig(pos: number, configs: Array<LightConfig>): void {
        for (let i = 0; i < configs.length && i < 3; ++i) {
            let config = configs[i];
            this.data.writeUInt8(config.channel, pos++);
            this.data.writeUInt8(config.effect, pos++);
            this.data.writeUInt8(config.start, pos++);
            this.data.writeUInt8(config.end, pos++);
            this.data.writeUInt8(config.cycles, pos++);
        }
    }
}

export {SetLights}
