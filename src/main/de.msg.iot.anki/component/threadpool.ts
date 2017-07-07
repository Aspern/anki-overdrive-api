import * as log4js from "log4js";
import {Logger} from "log4js";
import reject = Promise.reject;
import Timer = NodeJS.Timer;
import {Runnable} from "./runnable";

class Threadpool {

    private _logger: Logger;
    private _runningTasks: Array<Timer> = [];

    constructor() {
        this._logger = log4js.getLogger("threadpool");
    }

    submit(task: Runnable): void {
        let logger = this._logger;

        new Promise<void>((resolve, reject) => {
            try {
                task.run();
                resolve();
            } catch (error) {
                reject(error);
            }
        }).catch(error => {
            logger.error("Error while executing task.", error);
        });
    }

    scheduleAtFixedRate(task: Runnable, period: number, initialDelay = 0): void {
        let me = this;

        setTimeout(() => {
            me._runningTasks.push(setInterval(() => {
                me.submit(task);
            }, period));
        }, initialDelay);

    }

    scheduleWithFixedDelay(task: Runnable, delay: number, initialDelay = 0): void {

    }

    shutdown(timeout = 10000): Promise<void> {
        let task: number;

        return new Promise<void>((resolve, reject) => {
            task = setTimeout(() => {
                reject("Timeout while shutting down threadpool [" + timeout + "ms].");
            });

            this._runningTasks.forEach(task => {
                clearInterval(task);
            });
            clearTimeout(task);
            resolve();

        });
    }
}

export {Threadpool};