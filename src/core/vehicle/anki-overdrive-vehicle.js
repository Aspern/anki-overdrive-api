"use strict";
var position_update_message_1 = require("../message/position-update-message");
var transition_update_message_1 = require("../message/transition-update-message");
var intersection_update_message_1 = require("../message/intersection-update-message");
var vehicle_delocalized_message_1 = require("../message/vehicle-delocalized-message");
var AnkiOverdriveVehicle = (function () {
    function AnkiOverdriveVehicle(peripheral, name) {
        this._listeners = [];
        this._id = peripheral.id;
        this._address = peripheral.address;
        this._name = name;
        this._peripheral = peripheral;
    }
    AnkiOverdriveVehicle.prototype.connect = function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            me._peripheral.connect(function (e) {
                if (e)
                    reject(e);
                else
                    me.initCharacteristics()
                        .then(function () {
                        me.setSdkMode(true);
                        resolve();
                    })
                        .catch(reject);
            });
        });
    };
    AnkiOverdriveVehicle.prototype.disconnect = function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            me._peripheral.disconnect(function (e) {
                if (e)
                    reject(e);
                resolve();
            });
        });
    };
    AnkiOverdriveVehicle.prototype.setSpeed = function (speed, acceleration) {
        var data = new Buffer(7);
        data.writeUInt8(6, 0);
        data.writeUInt8(0x24, 1); // ANKI_VEHICLE_MSG_C2V_SET_SPEED
        data.writeUInt16LE(speed, 2);
        data.writeUInt16LE(acceleration || 500, 4);
        this._write.write(data);
    };
    AnkiOverdriveVehicle.prototype.setOffset = function (offset) {
        var data = new Buffer(6);
        data.writeUInt8(5, 0);
        data.writeUInt8(0x2c, 1); // ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER
        data.writeFloatLE(offset, 2);
        this._write.write(data);
    };
    AnkiOverdriveVehicle.prototype.changeLane = function (offset, speed, acceleration) {
        var data = new Buffer(12);
        data.writeUInt8(11, 0);
        data.writeUInt8(0x25, 1); // ANKI_VEHICLE_MSG_C2V_CHANGE_LANE
        data.writeUInt16LE(speed || 500, 2);
        data.writeUInt16LE(acceleration || 500, 4);
        data.writeFloatLE(offset, 6);
        this._write.write(data);
    };
    AnkiOverdriveVehicle.prototype.cancelLaneChange = function () {
        var data = new Buffer(2);
        data.writeUInt8(1, 0);
        data.writeUInt8(0x26, 1); // ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE
        this._write.write(data);
    };
    AnkiOverdriveVehicle.prototype.turnLeft = function () {
        this.turn(1 /* VEHICLE_TURN_LEFT */);
    };
    AnkiOverdriveVehicle.prototype.turnRight = function () {
        this.turn(2 /* VEHICLE_TURN_RIGHT */);
    };
    AnkiOverdriveVehicle.prototype.uTurn = function () {
        this.turn(3 /* VEHICLE_TURN_UTURN */);
    };
    AnkiOverdriveVehicle.prototype.uTurnJump = function () {
        this.turn(4 /* VEHICLE_TURN_UTURN_JUMP */);
    };
    AnkiOverdriveVehicle.prototype.setSdkMode = function (on) {
        var data = new Buffer(4);
        data.writeUInt8(3, 0);
        data.writeUInt8(0x90, 1); // ANKI_VEHICLE_MSG_C2V_SDK_MODE
        data.writeUInt8(on ? 0x1 : 0x0, 2);
        data.writeUInt8(0x1, 3);
        this._write.write(data);
    };
    AnkiOverdriveVehicle.prototype.queryPing = function () {
        var me = this, start = new Date().getMilliseconds();
        return new Promise(function (resolve, reject) {
            var request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x16, 1); // ANKI_VEHICLE_MSG_C2V_PING_REQUEST
            me.readOnce(request, 0x17) // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
                .then(function () {
                resolve(new Date().getMilliseconds() - start);
            })
                .catch(reject);
        });
    };
    AnkiOverdriveVehicle.prototype.queryVersion = function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x18, 1); // ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST
            me.readOnce(request, 0x19) // ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
                .then(function (data) {
                resolve(data.readUInt16LE(2));
            })
                .catch(reject);
        });
    };
    AnkiOverdriveVehicle.prototype.queryBatteryLevel = function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var request = new Buffer(2);
            request.writeUInt8(1, 0);
            request.writeUInt8(0x1a, 1); // ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST
            me.readOnce(request, 0x1b) // ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
                .then(function (data) {
                resolve(data.readUInt16LE(2));
            })
                .catch(reject);
        });
    };
    AnkiOverdriveVehicle.prototype.addListener = function (listener, filter) {
        this._listeners.push({ l: listener, f: filter });
    };
    AnkiOverdriveVehicle.prototype.removeListener = function (listener) {
        for (var i = 0; i < this._listeners.length; ++i) {
            if (this._listeners[i].l === listener)
                this._listeners.splice(i, 1);
        }
    };
    AnkiOverdriveVehicle.prototype.initCharacteristics = function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            me._peripheral.discoverAllServicesAndCharacteristics(function (e, services, characteristics) {
                if (e)
                    reject(e);
                characteristics.forEach(function (characteristic) {
                    if (characteristic.uuid === "be15bee06186407e83810bd89c4d8df4")
                        me._read = characteristic;
                    else if (characteristic.uuid === "be15bee16186407e83810bd89c4d8df4")
                        me._write = characteristic;
                });
                if (!me._write || !me._write)
                    reject(new Error(("Could not initialise read/write characteristics.")));
                me._read.subscribe();
                me.enableDataEvents();
                resolve();
            });
        });
    };
    AnkiOverdriveVehicle.prototype.enableDataEvents = function () {
        var me = this;
        this._read.on('data', function (data) {
            var id = data.readUInt8(1), message;
            if (id === 0x27)
                message = new position_update_message_1.PositionUpdateMessage(data, me._id);
            else if (id === 0x29)
                message = new transition_update_message_1.TransitionUpdateMessage(data, me._id);
            else if (id === 0x2a)
                message = new intersection_update_message_1.IntersectionUpdateMessage(data, me._id);
            else if (id === 0x2b)
                message = new vehicle_delocalized_message_1.VehicleDelocalizedMessage(data, me._id);
            if (message)
                me._listeners.forEach(function (listener) {
                    if (listener.f) {
                        if (message instanceof listener.f)
                            listener.l(message);
                    }
                    else {
                        listener.l(message);
                    }
                });
        });
    };
    AnkiOverdriveVehicle.prototype.readOnce = function (request, responseId, timeout) {
        var me = this, t = timeout || 1000;
        return new Promise(function (resolve, reject) {
            var handler = setTimeout(function () {
                reject(new Error("Received no message after " + t + "ms"));
            }, t), listener = function (data) {
                var id = data.readUInt8(1);
                if (id === responseId) {
                    clearTimeout(handler);
                    me._read.removeListener("data", listener);
                    resolve(data);
                }
            };
            me._read.on('data', listener);
            me._write.write(request);
        });
    };
    AnkiOverdriveVehicle.prototype.turn = function (type) {
        var data = new Buffer(4);
        data.writeUInt8(3, 0);
        data.writeUInt8(0x32, 1); // ANKI_VEHICLE_MSG_C2V_TURN
        data.writeUInt8(type, 2);
        this._write.write(data);
    };
    Object.defineProperty(AnkiOverdriveVehicle.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnkiOverdriveVehicle.prototype, "address", {
        get: function () {
            return this._address;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnkiOverdriveVehicle.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return AnkiOverdriveVehicle;
}());
exports.AnkiOverdriveVehicle = AnkiOverdriveVehicle;
//# sourceMappingURL=anki-overdrive-vehicle.js.map