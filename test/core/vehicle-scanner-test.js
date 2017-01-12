"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var vehicle_scanner_1 = require("../../src/core/vehicle/vehicle-scanner");
var VehicleScannerTest = (function () {
    function VehicleScannerTest() {
        this._id = "eb401ef0f82b";
        this._address = "eb:40:1e:f0:f8:2b";
    }
    VehicleScannerTest.prototype["find all vehicles"] = function (done) {
        var scanner = new vehicle_scanner_1.VehicleScanner();
        scanner.findAll().then(function (vehicles) {
            chai_1.expect(vehicles.length).not.to.be.empty;
            done();
        }).catch(function (e) { return done(e); });
    };
    VehicleScannerTest.prototype["find vehicle by id"] = function (done) {
        var scanner = new vehicle_scanner_1.VehicleScanner();
        scanner.findById(this._id).then(function (vehicle) {
            chai_1.expect(vehicle).not.to.be.null;
            done();
        }).catch(function (e) { return done(e); });
    };
    VehicleScannerTest.prototype["find vehicle by address"] = function (done) {
        var scanner = new vehicle_scanner_1.VehicleScanner();
        scanner.findByAddress(this._address).then(function (vehicle) {
            chai_1.expect(vehicle).not.to.be.null;
            done();
        }).catch(function (e) { return done(e); });
    };
    return VehicleScannerTest;
}());
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleScannerTest.prototype, "find all vehicles", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleScannerTest.prototype, "find vehicle by id", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleScannerTest.prototype, "find vehicle by address", null);
VehicleScannerTest = __decorate([
    mocha_typescript_1.suite
], VehicleScannerTest);
//# sourceMappingURL=vehicle-scanner-test.js.map