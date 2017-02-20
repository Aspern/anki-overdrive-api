import {Distance} from "./Result";

interface ResultHandler {

    handle(result: Array<[Distance, Array<Distance>]>): void

}

export {ResultHandler};