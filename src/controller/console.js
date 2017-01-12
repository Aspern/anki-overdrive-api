"use strict";
var _this = this;
var vehicle_scanner_1 = require("../../src/core/vehicle/vehicle-scanner");
var util_1 = require("util");
var readline = require('readline');
var vehicles;
console.log("scanning vehicles...");
var scanner = new vehicle_scanner_1.VehicleScanner();
scanner.findAll().then(function (vehicles) {
    _this.vehicles = vehicles;
    vehicles.forEach(function (vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    initializePrompt(_this.vehicles);
});
function initializePrompt(vehicles) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'ANKI> '
    });
    rl.prompt();
    rl.on('line', function (line) {
        line = line.trim();
        var input = line.split(' ');
        var command = input[0];
        var index = input[1];
        if (index < 0 || index > vehicles.length) {
            console.log("car not found.");
            return;
        }
        switch (command) {
            case 'help':
                console.log('Available commands:\n' +
                    'c [carId] - connect to car\n' +
                    'd [carId] - disconnect from car\n' +
                    's [carId] [speed] [accelaration] - set speed and accelaration of car\n');
                break;
            case 'c':
                vehicles[index].connect().then(function () {
                    console.log("car connected");
                });
                break;
            case 's':
                var speed = input[2];
                var accelaration = input[3];
                speed = util_1.isNullOrUndefined(speed) ? 200 : speed;
                accelaration = util_1.isNullOrUndefined(accelaration) ? 50 : accelaration;
                try {
                    vehicles[index].setSpeed(speed, accelaration);
                }
                catch (e) {
                    if (e.message === "Cannot read property 'write' of undefined")
                        console.log("error. car is not connected!");
                }
                break;
            case 'd':
                vehicles[index].disconnect().then(function () {
                    console.log("car disconnected");
                });
                break;
            default:
                console.log('command not found');
                break;
        }
        rl.prompt();
    }).on('close', function () {
        console.log('Good bye. Thank you for using anki!');
        process.exit(0);
    });
}
//# sourceMappingURL=console.js.map