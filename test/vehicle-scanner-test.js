var chai = require("chai");
var expect = chai.expect;
var scanner = require("../lib/vehicle-scanner");

// Addresses of devices that should be tested.
const addresses = [
    "eb:40:1e:f0:f8:2b",
    "ed:0c:94:21:65:53",
    "e4:2c:34:2d:46:6c",
    "ef:b1:12:b5:ad:e2"
];

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
describe("vehicle-scanner", function () {
    describe("findAll", function () {
        it("finds all vehicles in 1 second", function () {
            return scanner.findAll().then(function (vehicles) {
                expect(vehicles.length).to.equal(addresses.length);
                vehicles.forEach(function (vehicle) {
                    var index = addresses.indexOf(vehicle.getAddress());
                    expect(index).within(0, 3);
                }, function (e) {
                    throw e;
                });
            });
        });
    });
});