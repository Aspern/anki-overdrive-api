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
var position_update_message_1 = require("../../src/core/message/position-update-message");
var VehicleTest = VehicleTest_1 = (function () {
    function VehicleTest() {
    }
    VehicleTest.before = function (done) {
        var _this = this;
        var scanner = new vehicle_scanner_1.VehicleScanner();
        scanner.findById(this._id).then(function (vehicle) {
            _this._vehicle = vehicle;
            _this._vehicle
                .connect()
                .then(function () { return done(); });
        });
    };
    VehicleTest.after = function (done) {
        this._vehicle
            .disconnect()
            .then(function () { return done(); })
            .catch(function (e) { return done(e); });
    };
    VehicleTest.prototype["set speed and stop"] = function (done) {
        var speed = 500, listener = function (msg) {
            chai_1.expect(msg.speed).approximately(speed, 25);
            VehicleTest_1._vehicle.removeListener(listener);
            VehicleTest_1._vehicle.setSpeed(0, 1500);
            done();
        };
        VehicleTest_1._vehicle.setSpeed(speed, 250);
        // Add listener after 1 second to ensure that vehicle is driving.
        setTimeout(function () {
            VehicleTest_1._vehicle.addListener(listener, position_update_message_1.PositionUpdateMessage);
        }, 1000);
    };
    VehicleTest.prototype["change lane"] = function (done) {
        var offset = -68.0, listener = function (msg) {
            chai_1.expect(msg.offset).approximately(offset, 1);
            VehicleTest_1._vehicle.removeListener(listener);
            VehicleTest_1._vehicle.setSpeed(0, 1500);
            done();
        };
        VehicleTest_1._vehicle.setSpeed(500, 250);
        setTimeout(function () {
            VehicleTest_1._vehicle.changeLane(offset);
            // Add listener after 1 second to ensure that vehicle is driving.
            setTimeout(function () {
                VehicleTest_1._vehicle.addListener(listener, position_update_message_1.PositionUpdateMessage);
            }, 1000);
        }), 1500;
    };
    VehicleTest.prototype["set offset"] = function (done) {
        var offset = 23.5, listener = function (msg) {
            chai_1.expect(msg.offset).approximately(offset, 1);
            VehicleTest_1._vehicle.removeListener(listener);
            VehicleTest_1._vehicle.setSpeed(0, 1500);
            done();
        };
        VehicleTest_1._vehicle.setSpeed(500, 250);
        setTimeout(function () {
            VehicleTest_1._vehicle.setOffset(offset);
            // Add listener after 1 second to ensure that vehicle is driving.
            setTimeout(function () {
                VehicleTest_1._vehicle.addListener(listener, position_update_message_1.PositionUpdateMessage);
            }, 1000);
        }), 1500;
    };
    VehicleTest.prototype["query ping"] = function (done) {
        VehicleTest_1._vehicle
            .queryPing()
            .then(function (ping) {
            chai_1.expect(ping).gt(0);
            done();
        }).catch(function (e) { return done(e); });
    };
    VehicleTest.prototype["query version"] = function (done) {
        VehicleTest_1._vehicle
            .queryVersion()
            .then(function (version) {
            chai_1.expect(version).gt(0);
            done();
        }).catch(function (e) { return done(e); });
    };
    VehicleTest.prototype["query battery level"] = function (done) {
        VehicleTest_1._vehicle
            .queryBatteryLevel()
            .then(function (batteryLevel) {
            chai_1.expect(batteryLevel).gt(0);
            done();
        }).catch(function (e) { return done(e); });
    };
    return VehicleTest;
}());
VehicleTest._id = "eb401ef0f82b";
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "set speed and stop", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "change lane", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "set offset", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "query ping", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "query version", null);
__decorate([
    mocha_typescript_1.test, mocha_typescript_1.timeout(5000)
], VehicleTest.prototype, "query battery level", null);
__decorate([
    mocha_typescript_1.timeout(5000)
], VehicleTest, "before", null);
__decorate([
    mocha_typescript_1.timeout(5000)
], VehicleTest, "after", null);
VehicleTest = VehicleTest_1 = __decorate([
    mocha_typescript_1.suite
], VehicleTest);
var VehicleTest_1;
//# sourceMappingURL=vehicle-test.js.map