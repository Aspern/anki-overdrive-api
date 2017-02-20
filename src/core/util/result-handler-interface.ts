import {Result} from "./result";

interface ResultHandler {

    handle(result: Array<[Result, Array<Result>]>): void

}

export {ResultHandler};