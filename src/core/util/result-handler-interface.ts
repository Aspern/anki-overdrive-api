import {Distance} from "./result";

interface ResultHandler {

    handle(result: Array<[Distance, Array<Distance>]>): void

}

export {ResultHandler};