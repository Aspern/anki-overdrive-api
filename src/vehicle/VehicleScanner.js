"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const Vehicle_1 = require("./Vehicle");
const GattProfile_1 = require("../message/GattProfile");
class VehicleScanner {
    constructor(bluetooth, timeout = 500) {
        this._bluetooth = bluetooth;
        this._bluetooth.onDiscover = this.onDiscover.bind(this);
        this._logger = log4js.getLogger();
        this._timeout = timeout;
    }
    findAll() {
        const self = this;
        return new Promise((resolve, reject) => {
            self._vehicles = [];
            self._bluetooth.startScanning([GattProfile_1.ANKI_STR_SERVICE_UUID])
                .then(() => {
                self.awaitScanning()
                    .then(resolve)
                    .catch(reject);
            }).catch();
        });
    }
    findById(id) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.findAll()
                .then(vehicles => {
                resolve(vehicles.find(v => v.id === id));
            })
                .catch(reject);
        });
    }
    findByAddress(address) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.findAll()
                .then(vehicles => resolve(vehicles.find(vehicle => vehicle.address === address)))
                .catch(reject);
        });
    }
    findAny() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.findAll()
                .then(vehicles => resolve(vehicles.pop()))
                .catch(reject);
        });
    }
    onError(handler) {
        this._bluetooth.onError = handler.bind(this);
    }
    set timeout(timeout) {
        this._timeout = timeout;
    }
    get timeout() {
        return this._timeout;
    }
    onDiscover(device) {
        if (!this.containsVehicle(device.id)) {
            this._vehicles.push(new Vehicle_1.Vehicle(device));
        }
    }
    containsVehicle(id) {
        return this._vehicles.filter(vehicle => vehicle.id === id).length > 0;
    }
    awaitScanning() {
        const self = this;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                self._bluetooth.stopScanning()
                    .then(() => {
                    resolve(self._vehicles);
                })
                    .catch(reject);
            }, self._timeout);
        });
    }
}
exports.VehicleScanner = VehicleScanner;
