"use strict";
var vehicle_scanner_1 = require("./src/core/vehicle/vehicle-scanner");
var vehicle_delocalized_message_1 = require("./src/core/message/vehicle-delocalized-message");
var scanner = new vehicle_scanner_1.VehicleScanner();
scanner.findById("ed0c94216553").then(function (vehicle) {
    vehicle.connect().then(function () {
        vehicle.addListener(function (message) {
            console.log(message);
        }, vehicle_delocalized_message_1.VehicleDelocalizedMessage);
        vehicle.setSpeed(2000);
    }).catch(console.error);
}).catch(console.error);
