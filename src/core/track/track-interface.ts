import {Distance} from "./Distance";

interface Track {

    getDistance(vehicleId1: string, vehicleId2: string) : number

    getDistances(vehicleId: string) : Array<Distance>

    getAllDistances() : Array<Distance>
}

export {Track};
