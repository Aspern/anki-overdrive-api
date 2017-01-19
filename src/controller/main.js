"use strict";
var _this = this;
var vehicle_scanner_1 = require("../core/vehicle/vehicle-scanner");
var console_1 = require("./console");
var position_update_message_1 = require("../core/message/position-update-message");
var kafkacontroller_1 = require("./kafka/kafkacontroller");
var ConsumerMessage_1 = require("./kafka/ConsumerMessage");
var vehicles;
console.log("scanning vehicles...");
var scanner = new vehicle_scanner_1.VehicleScanner();
var ankiConsole = new console_1.AnkiConsole();
scanner.findAll().then(function (vehicles) {
    _this.vehicles = vehicles;
    vehicles.forEach(function (vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    ankiConsole.initializePrompt(vehicles);
    vehicles[0].addListener(function (message) {
        console.log(message);
    }, position_update_message_1.PositionUpdateMessage);
});
var kafka = new kafkacontroller_1.KafkaController('localhost:2181');
kafka.addListener(function (message) {
    console.log(message);
}, ConsumerMessage_1.ConsumerMessage);
kafka.initializeConsumer([{ topic: 'test', partition: 0 }]);
kafka.initializeProducer().then(function (isStarted) {
    //isStarted ? kafka.sendPayload([ { topic: 'test', messages: "finally working again" , partitions: 1 }]): console.log('not started');
});
//# sourceMappingURL=main.js.map