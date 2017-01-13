"use strict";
/// <reference path="../../../decl/noble.d.ts"/>
var noble = require("noble");
var anki_overdrive_vehicle_1 = require("./anki-overdrive-vehicle");
var VehicleScanner = (function () {
    function VehicleScanner(timeout, retries) {
        this.timeout = timeout || 1000;
        this.retries = retries || 3;
    }
    VehicleScanner.prototype.findAll = function () {
        var _this = this;
        var vehicles = [], me = this;
        return new Promise(function (resolve, reject) {
            me.onAdapterOnline().then(function () {
                var callback = function (peripheral) {
                    vehicles.push(new anki_overdrive_vehicle_1.AnkiOverdriveVehicle(peripheral));
                };
                noble.startScanning();
                noble.on('discover', callback);
                // Wait until timeout, then stop scanning.
                setTimeout(function () {
                    noble.stopScanning();
                    noble.removeListener('discover', callback);
                    resolve(vehicles);
                }, _this.timeout);
            })["catch"](reject);
        });
    };
    VehicleScanner.prototype.findById = function (id) {
        var me = this;
        return new Promise(function (resolve, reject) {
            me.findAll().then(function (vehicles) {
                vehicles.forEach(function (vehicle) {
                    if (vehicle.id === id)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with id [" + id + "]."));
            })["catch"](reject);
        });
    };
    VehicleScanner.prototype.findByAddress = function (address) {
        var me = this;
        return new Promise(function (resolve, reject) {
            me.findAll().then(function (vehicles) {
                vehicles.forEach(function (vehicle) {
                    if (vehicle.address === address)
                        resolve(vehicle);
                });
                reject(new Error("Found no vehicle with address [" + address + "]."));
            })["catch"](reject);
        });
    };
    VehicleScanner.prototype.onAdapterOnline = function () {
        var _this = this;
        var counter = 0, me = this;
        return new Promise(function (resolve, reject) {
            var i = setInterval(function () {
                if (noble.state === "poweredOn") {
                    resolve();
                    clearInterval(i);
                }
                if (counter === me.retries) {
                    reject(new Error("BLE Adapter offline"));
                    clearInterval(i);
                }
                ++counter;
            }, _this.timeout);
        });
    };
    return VehicleScanner;
}());
exports.VehicleScanner = VehicleScanner;
//# sourceMappingURL=vehicle-scanner.js.map