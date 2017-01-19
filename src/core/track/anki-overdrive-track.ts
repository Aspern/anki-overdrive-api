import {Track} from "./track-interface";
import {Distance} from "./distance";

class AnkiOverdriveTrack implements Track {

    getDistance(vehicleId1: string, vehicleId2: string): number {
        return this.getDistaneObj(vehicleId1, vehicleId2).distance;
    }

    getDistances(vehicleId: string): Array<Distance> {
        return null;
    }

    getAllDistances(): Array<Distance> {
        return null;
    }

    private getDistaneObj(vehicleId1: string, vehicleId2: string): Distance {
        return null;
    }
}

export {AnkiOverdriveTrack};