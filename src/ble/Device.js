"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Device {
    constructor(id, address, peripheral) {
        this.id = id;
        this.address = address;
        this._peripheral = peripheral;
        this._connected = false;
        this._listeners = [];
    }
    connect(read, write) {
        const self = this;
        return new Promise((resolve, reject) => {
            self._peripheral.connect(error => {
                if (error) {
                    reject(error);
                }
                else {
                    self.initCharacteristics(read, write)
                        .then(() => {
                        self.enableDataListener();
                        self._connected = true;
                        resolve(self);
                    })
                        .catch(reject);
                }
            });
        });
    }
    disconnect() {
        const self = this;
        return new Promise((resolve) => {
            this.removeWrite();
            this.removeRead();
            self._peripheral.disconnect(() => {
                this._listeners = [];
                this._connected = false;
                resolve(self);
            });
        });
    }
    read(listener) {
        this._listeners.push(listener);
    }
    write(data) {
        const self = this;
        return new Promise((resolve, reject) => {
            self._write.write(data, false, error => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    initCharacteristics(read, write) {
        const self = this;
        return new Promise((resolve, reject) => {
            self._peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                if (error) {
                    reject(error);
                }
                else {
                    characteristics.forEach(characteristic => {
                        if (read && characteristic.uuid === read) {
                            self._read = characteristic;
                        }
                        else if (write && characteristic.uuid === write) {
                            self._write = characteristic;
                        }
                    });
                    if (read && !self._read) {
                        reject("Could not initialize read characteristic.");
                    }
                    else if (write && !self._write) {
                        reject("Could not initialize write characteristic.");
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
    enableDataListener() {
        const self = this;
        this._read.subscribe();
        this._read.on("data", (data) => {
            self._listeners.forEach(listener => listener(data));
        });
    }
    removeWrite() {
        delete this._write;
    }
    removeRead() {
        const self = this;
        this._listeners.forEach(listener => {
            self._read.removeListener("data", listener);
        });
        this._read.unsubscribe();
        delete this._read;
    }
}
exports.Device = Device;
