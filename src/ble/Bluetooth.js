"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noble = require("noble");
const Device_1 = require("./Device");
class Bluetooth {
    constructor(onDiscover = () => { }, onError = () => { }, timeout = 500) {
        this._state = "unknown";
        this._retries = 3;
        this._onDiscover = onDiscover;
        this._onError = onError;
        this._timeout = timeout;
    }
    startScanning(serviceUUIDS) {
        const self = this;
        const uuids = serviceUUIDS || [];
        return new Promise((resolve, reject) => {
            self.enableAdapter().then(() => {
                noble.startScanning(uuids, false);
                noble.on("discover", (peripheral => {
                    self._onDiscover(new Device_1.Device(peripheral.id, peripheral.address, peripheral));
                }));
                noble.on("error", self._onError);
                self._state = "poweredOn";
                resolve();
            }).catch(reject);
        });
    }
    stopScanning() {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self._state === "poweredOn") {
                noble.stopScanning();
                noble.removeListener("discover", this._onDiscover);
                noble.removeListener("error", this._onError);
                this._state = "disconnected";
                resolve();
            }
            else {
                reject(new Error("Bluetooth is still offline."));
            }
        });
    }
    set onDiscover(callback) {
        this._onDiscover = callback;
    }
    set onError(callback) {
        this._onError = callback;
    }
    set timeout(timeout) {
        this._timeout = timeout;
    }
    get timeout() {
        return this._timeout;
    }
    get state() {
        return this._state;
    }
    enableAdapter() {
        const self = this;
        let interval;
        let counter = 0;
        return new Promise((resolve, reject) => {
            interval = setInterval(() => {
                if (noble.state === "poweredOn") {
                    clearInterval(interval);
                    self._state = "poweredOn";
                    resolve();
                }
                if (counter === self._retries) {
                    clearInterval(interval);
                    self._state = "disconnected";
                    reject(new Error("Bluetooth is offline."));
                }
                ++counter;
            }, this._timeout);
        });
    }
}
exports.Bluetooth = Bluetooth;
