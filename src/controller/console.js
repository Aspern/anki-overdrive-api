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
        if (command === "help") {
            console.log('Available commands:\n' +
                'c [carIndex] - connect to car\n' +
                'd [carIndex] - disconnect from car\n' +
                's [carIndex] [speed] [accelaration] - set speed and accelaration of car\n' +
                'l [carIndex] - turn left\n' +
                'r [carIndex] - turn right\n' +
                'u [carIndex] - u turn\n' +
                'p [carIndex] - ping car\n' +
                'b [carIndex] - battery level of car\n');
            return;
        }
        if (index < 0 || index > vehicles.length || util_1.isNullOrUndefined(index)) {
            console.log("car not found.");
            return;
        }
        switch (command) {
            //case 'help':
            //  break;
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
            case 'l':
                vehicles[index].turnLeft();
                break;
            case 'r':
                vehicles[index].turnRight();
                break;
            case 'u':
                vehicles[index].uTurn();
                break;
            case 'd':
                vehicles[index].disconnect().then(function () {
                    console.log("car disconnected");
                });
                break;
            case 'p':
                vehicles[index].queryPing().then(function (result) {
                    util_1.isNullOrUndefined(result) ? console.log('no data, may be car not connected.') : console.log(result);
                });
                break;
            case 'b':
                vehicles[index].queryBatteryLevel().then(function (result) {
                    util_1.isNullOrUndefined(result) ? console.log('no data, may be car not connected.') : console.log(result);
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