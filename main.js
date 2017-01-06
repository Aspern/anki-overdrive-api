"use strict";
var vehicle_scanner_1 = require("./src/vehicle/vehicle-scanner");
var scanner = new vehicle_scanner_1.VehicleScanner();
scanner.findAll().then(function (vehicles) {
    console.log(vehicles);
});
