import {VehicleConfig} from "./vehicle-config";
import {TrackConfig} from "./track-config";
interface SetupConfig {
    ean: string;
    uuid: string;
    vehicles: Array<VehicleConfig>
    track: TrackConfig;
    online: boolean;
    websocket: string
}

export {SetupConfig}