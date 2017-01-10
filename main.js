"use strict";
var vehicle_scanner_1 = require("./src/core/vehicle-scanner");
var scanner = new vehicle_scanner_1.VehicleScanner();
scanner.findById("eb401ef0f82b").then(function (vehicle) {
    vehicle.connect().then(function () {
        vehicle.setSpeed(500);
    }).catch(console.error);
});
