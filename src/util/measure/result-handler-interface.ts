import {Distance} from "./distance";

interface ResultHandler {

    handle(result: Array<[Distance, Array<Distance>]>): void

}

export {ResultHandler};