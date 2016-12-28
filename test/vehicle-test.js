var chai = require("chai");
var expect = chai.expect;
var scanner = require("../lib/vehicle-scanner");

// Vehicles found by the scanner.
vehicles = [];

/**
 **************************************************************
 *                      WARNING                               *
 *                                                            *
 *  This is a hardware test. Please ensure, that all vehicles *
 *   with the defined addresses above are enabled and placed  *
 *             on the track before starting test.             *
 *                                                            *
 * ************************************************************
 */
describe('hooks', function () {

    // Scan and load vehicles before testing
    before(function (done) {
        scanner.findAll().then(function (v) {
            vehicles = v;
            done();
        }, function (e) {
            done(e);
        });
    });

    after(function () {
        // runs after all tests in this block
    });

    beforeEach(function () {
        // runs before each test in this block
    });

    afterEach(function () {
        // runs after each test in this block
    });

    describe("vehicle-tests", function () {

        // Modify the array with the num of vehicles that should be tested
        // TODO: Find better data driven test development.
        [0, 1, 2, 3].forEach(function (i) {
            describe("vehicle [" + i + "]", function () {

                it("is connected", function (done) {
                    var vehicle = vehicles[i];
                    expect(vehicle).not.to.be.undefined;

                    vehicle.connect().then(function () {
                        expect(vehicle._state).to.be.equal(1);
                        vehicle.disconnect().then(function () {
                            expect(vehicle._state).to.be.equal(0);
                            done();
                        }, function (e) {
                            done(e);
                        });
                    }, function (e) {
                        done(e);
                    });
                }).timeout(6000);

                it("drive and stop", function (done) {
                    var vehicle = vehicles[i];
                    expect(vehicle).not.to.be.undefined;

                    vehicle.connect().then(function () {
                        vehicle.setSpeed(500, 600);
                        setTimeout(function () {
                            vehicle.setSpeed(0, 1500);
                            vehicle.disconnect();
                            done();
                        }, 2000);
                    });

                }).timeout(6000);

                it("query battery level", function (done) {
                    var vehicle = vehicles[i];
                    expect(vehicle).not.to.be.undefined;

                    vehicle.connect().then(function () {
                        vehicle.queryBatteryLevel().then(function (level) {
                            expect(level).not.to.be.undefined;
                            vehicle.disconnect();
                        });
                    });
                }).timeout(6000);

            });

        });
    });
});