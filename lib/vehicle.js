var noble = require('noble');

const ANKI_STR_CHR_READ_UUID = require('./vehicle-gatt-profile').ANKI_STR_CHR_READ_UUID;
const ANKI_STR_CHR_WRITE_UUID = require('./vehicle-gatt-profile').ANKI_STR_CHR_WRITE_UUID;

// BLE Connections
const ANKI_VEHICLE_MSG_C2V_DISCONNECT = 0x0d;

// Ping request / response
const ANKI_VEHICLE_MSG_C2V_PING_REQUEST = 0x16;
const ANKI_VEHICLE_MSG_V2C_PING_RESPONSE = 0x17;

// Messages for checking vehicle version info
const ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST = 0x18;
const ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE = 0x19;

// Battery level
const ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST = 0x1a;
const ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE = 0x1b;

// Lights
const ANKI_VEHICLE_MSG_C2V_SET_LIGHTS = 0x1d;

// Driving Commands
const ANKI_VEHICLE_MSG_C2V_SET_SPEED = 0x24;
const ANKI_VEHICLE_MSG_C2V_CHANGE_LANE = 0x25;
const ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE = 0x26;
const ANKI_VEHICLE_MSG_C2V_TURN = 0x32;

// Vehicle position updates
const ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE = 0x27;
const ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE = 0x29;
const ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE = 0x2a;
const ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED = 0x2b;
const ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER = 0x2c;
const ANKI_VEHICLE_MSG_V2C_OFFSET_FROM_ROAD_CENTER_UPDATE = 0x2d;

// Light Patterns
const ANKI_VEHICLE_MSG_C2V_LIGHTS_PATTERN = 0x33;

// Vehicle Configuration Parameters
const ANKI_VEHICLE_MSG_C2V_SET_CONFIG_PARAMS = 0x45;

// SDK Mode
const ANKI_VEHICLE_MSG_C2V_SDK_MODE = 0x90;

// Types for vehicle turn
const VEHICLE_TURN_NONE = 0;
const VEHICLE_TURN_LEFT = 1;
const VEHICLE_TURN_RIGHT = 2;
const VEHICLE_TURN_UTURN = 3;
const VEHICLE_TURN_UTURN_JUMP = 4;

// Trigger for vehicle turns
const VEHICLE_TURN_TRIGGER_IMMEDIATE = 0;
const VEHICLE_TURN_TRIGGER_INTERSECTION = 1;

const VEHICLE_STATE_CONNECTED = 1;
const VEHICLE_STATE_DISCONNECTED = 0;

/**
 * Creates an instance of a vehicle.
 *
 * @param {Object} device BLE device of the vehicle
 * @constructor
 */
function Vehicle(device) {
    var me = this;

    this._device = device;
    this._read = null;
    this._write = null;
    this._state = VEHICLE_STATE_DISCONNECTED;
    this._data = {};
    this._dataCallback = function (data) {
        me._data = data;
    }
}

/**
 * Connects the vehicle with the BLE network. After establishing the connection and searching
 * the read/write characteristics, the vehicle tries to send an message to activate the SDK
 * mode. Without the SDK mode enabled, the vehicle cannot receive commands.
 *
 * @returns {Promise} Successful connection
 */
Vehicle.prototype.connect = function () {
    var me = this;

    return new Promise(function (resolve, reject) {
        me._device.connect(function (error) {
            if (error)
                reject(error);

            me._device.discoverAllServicesAndCharacteristics(
                function (error, services, characteristics) {
                    if (error)
                        reject(error);

                    characteristics.forEach(function (characteristic) {
                        if (characteristic.uuid === ANKI_STR_CHR_WRITE_UUID) {
                            me._write = characteristic;
                        } else if (characteristic.uuid === ANKI_STR_CHR_READ_UUID) {
                            me._read = characteristic;
                        }
                    });

                    if (!me._read || !me._write)
                        reject(new Error("Cannot find read/write characteristics"));

                    me._read.subscribe();

                    me.setSdkMode(1).then(function (success) {
                        me._state = VEHICLE_STATE_CONNECTED;
                        me.subscribeLocalizationPositionUpdate(me._dataCallback);
                        resolve(this);
                    }, function (error) {
                        reject(error);
                    });
                });

        });
    });
}

/**
 * Disconnects the vehicle from the BLE network.
 *
 * @returns {Promise} State after successfully disconnection
 */
Vehicle.prototype.disconnect = function () {
    var me = this;
    return new Promise(function (resolve, reject) {
        me._device.disconnect(function (error) {
            if (error)
                reject(error)

            me._state = VEHICLE_STATE_DISCONNECTED;
            resolve();
        });
    });
}

/**
 * Returns the ping between the vehicle and the operating system.
 *
 * @returns {Promise} Ping between the vehicle and the operating system.
 */
Vehicle.prototype.queryPing = function () {
    var me = this;

    return new Promise(function (resolve, reject) {
        me.readMessage(ANKI_VEHICLE_MSG_V2C_PING_RESPONSE, resolve, me.parsePingMessage, true);

        msg.writeUInt8(0x1, 0);
        msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_PING_REQUEST, 1);
        me.sendMessage(msg).catch(function (error) {
            reject(error);
        });
    });
}

/**
 * Returns the version of the vehicles firmware.
 *
 * @returns {Promise} Version of the vehicles firmware
 */
Vehicle.prototype.queryVersion = function () {
    var me = this;

    return new Promise(function (resolve, reject) {
        me.readMessage(ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE,
            resolve,
            me.parseVersionMessage,
            true);

        var msg = new Buffer(2);
        msg.writeUInt8(0x1, 0);
        msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_VERSION_REQUEST, 1);
        me.sendMessage(msg).catch(function (error) {
            reject(error);
        });
    });
}

/**
 * Returns the battery level of the vehicle.
 *
 * @returns {Promise} Battery level of the vehicle
 */
Vehicle.prototype.queryBatteryLevel = function () {
    var me = this;

    return new Promise(function (resolve, reject) {
        me.readMessage(ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE, resolve,
            me.parseBatteryLevelMessage, true);

        var msg = new Buffer(2);
        msg.writeUInt8(0x1, 0);
        msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST, 1);
        me.sendMessage(msg).catch(function (error) {
            reject(error);
        });
    });
}

/**
 * Sets the speed of the vehicle. The acceleration ot achieve the speed can also be set.
 *
 * @param {Integer} speed speed in mm/sec
 * @param {Integer} (optional) accel acceleration, default is 1500 mm/sec²
 * @param {Boolean} (otpional) respectRoadPieceSpeedLimit TODO: Find out about this setting
 * @returns {Promise} state after setting speed
 */
Vehicle.prototype.setSpeed = function (speed, accel, respectRoadPieceSpeedLimit) {
    var a = accel || 1500;
    var r = respectRoadPieceSpeedLimit ? 0x1 : 0x0;
    var msg = new Buffer(7);

    msg.writeUInt8(0x06, 0);
    msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_SPEED, 1);
    msg.writeInt16LE(speed, 2);
    msg.writeInt16LE(a, 4);
    msg.writeUInt8(r, 6);

    return this.sendMessage(msg);
}

/**
 * Executes a turn on the vehicle. Following turn types are possible.
 * <ul>
 *    <li>VEHICLE_TURN_NONE        (0)</li>
 *    <li>VEHICLE_TURN_LEFT        (1)/li>
 *    <li>VEHICLE_TURN_RIGHT       (2)</li>
 *    <li>VEHICLE_TURN_UTURN       (3)</li>
 *    <li>VEHICLE_TURN_UTURN_JUMP  (4)</li>
 * </ul>
 *
 * @param {Integer} type Type of the turn
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * intersection
 * @returns {Promise} State after a turn
 */
Vehicle.prototype.turn = function (type, immediate) {
    var i = immediate ? VEHICLE_TURN_TRIGGER_IMMEDIATE : VEHICLE_TURN_TRIGGER_INTERSECTION;
    var msg = new Buffer(4);

    msg.writeUInt8(0x03, 0);
    msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_TURN, 1);
    msg.writeUInt8(type, 2);
    msg.writeUInt8(i, 3);

    return this.sendMessage(msg);
}

/**
 * Executes a no turn on the vehicle.
 *
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * @returns {Promise} state after the no turn
 */
Vehicle.prototype.noTurn = function (immediate) {
    return this.turn(VEHICLE_TURN_NONE, immediate);
}

/**
 * Executes a right-turn on the vehicle.
 *
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * @returns {Promise} state after the right-turn
 */
Vehicle.prototype.turnLeft = function (immediate) {
    return this.turn(VEHICLE_TURN_RIGHT, immediate);
}

/**
 * Executes a left-turn on the vehicle.
 *
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * @returns {Promise} state after the left-turn
 */
Vehicle.prototype.turnRight = function (immediate) {
    return this.turn(VEHICLE_TURN_LEFT, immediate);
}

/**
 * Executes a u-turn on the vehicle.
 *
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * @returns {Promise} state after the u-turn
 */
Vehicle.prototype.uTurn = function (immediate) {
    return this.turn(VEHICLE_TURN_UTURN, immediate);
}

/**
 * Executes a u-turn with jump on the vehicle.
 *
 * @param {Boolean} (otptional) defines if the turn should be executed immediately or at the
 * next, default is immediate (true)
 * @returns {Promise} state after the u-turn with jump
 */
Vehicle.prototype.uTurnJumṕ = function (immediate) {
    return this.turn(VEHICLE_TURN_UTURN_JUMP, mmediate);
}

/**
 * Defines the offset from road center, where the vehicle should drive.
 *
 * @param {Float} offset Offset from road center in mm
 * @returns {Promise} State after the offset is reached
 */
Vehicle.prototype.offsetFromRoadCenter = function (offset) {
    var msg = new Buffer(6);

    msg.writeUInt8(5, 0);
    msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER, 1);
    msg.writeFloatLE(offset, 2);

    return this.sendMessage(msg);
}

/**
 * Changes the lane of the vehicle using the offset from road center. The speed and acceleration
 * could also be defined while changing the lane.
 *
 * @param {Float} offset Offset from road center in mm
 * @param {Integer} (optional) speed Speed in mm/sec, default is 500
 * @param {integer} accel (optional) acceleration, default is 1500 mm/sec²
 * @param {Integer} hopIntent (optional) TODO: Find out what this config does
 * @param {Iteger} tag (optional) TODO: Find out what this config does
 * @returns {Promise} State after lane change
 */
Vehicle.prototype.changeLane = function (offset, speed, accel, hopIntent, tag) {
    var s = speed || 500;
    var a = accel || 1500;
    var h = hopIntent || 0x0;
    var t = tag || 0x0;
    var msg = new Buffer(12);

    msg.writeUInt8(11, 0);
    msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_CHANGE_LANE, 1);
    msg.writeInt16LE(s, 2);
    msg.writeInt16LE(a, 4);
    msg.writeFloatLE(offset, 6);
    msg.writeUInt8(h, 10);
    msg.writeUInt8(t, 11);

    return this.sendMessage(msg);
}

/**
 * Registers a listener on position updates for the vehicle.
 *
 * @param {Function} callback Listener for position updates
 */
Vehicle.prototype.subscribeLocalizationPositionUpdate = function (callback) {
    this.readMessage(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE,
        callback,
        this.parseLocalizationPositionUpdateMessage);
}

/**
 * Registers a listener on transition updates for the vehicle.
 *
 * @param {Function} callback Listener for transition updates
 */
Vehicle.prototype.subscribeTransitionPositionUpdate = function (callback) {
    this.readMessage(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE,
        callback,
        this.parseLocalizationTransitionUpdateMessage);
}

/**
 * Registers a listener on intersection updates for the vehicle.
 *
 * @param {Function} callback Listener for intersection updates
 */
Vehicle.prototype.subscribeLocalizationIntersectionUpdate = function (callback) {
    this.readMessage(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE,
        callback,
        this.parseLocalizationIntersectionUpdateMessage);
}

/**
 * Registers a listener on offset from road center updates for the vehicle.
 *
 * @param {Function} callback Listener for offset from road center updates
 */
Vehicle.prototype.subscribeOffsetFromRoadCenterUpdate = function (callback) {
    this.readMessage(ANKI_VEHICLE_MSG_V2C_OFFSET_FROM_ROAD_CENTER_UPDATE,
        callback,
        this.parseOffsetFromRoadCenterUpdateMessage);
}

/**
 * Sets the light of the vehicle. There can be setup 3 lights at once using a channel and a
 * effect. Each car has a light in front, back and on top, so the best practice is to send an
 * array with [fronConfig, topConfig, backConfig].
 *
 * @param {Array} config Contains up to three light config objects.
 * @param config.channel Channel of the light possible values are
 *                          LIGHT_RED      (0) on top
 *                          LIGHT_TAIL     (1)
 *                          LIGHT_BLUE     (2) on top
 *                          LIGHT_GREEN    (3) on top
 *                          LIGHT_FRONTL   (4)
 *                          LIGHT_FRONTR   (5)
 * @param config.effect Effect of the light, possible values are
 *                          EFFECT_STEADY   (1) set the light intensity to 'start' value
 *                          EFFECT_FADE     (2) fade intensity from 'start' to 'end'
 *                          EFFECT_THROB    (3) fade intensity from 'start' to 'end' and back
 *                          EFFECT_FLASH    (4) flash between time 'start' and time 'end' inclusive
 *                          EFFECT_RANDOM   (5)
 * @param config.start light intensity between 0 and 10
 * @param config.end light intensity between 0  and 10
 * @param config.cycles (optional) cycles per 10 seconds, default is 10
 * @returns {Promise} State after sending the light config
 */
Vehicle.prototype.setLightPattern = function (config) {
    var msg = new Buffer(18);
    var channelCount = config.length > 3 ? 3 : config.length;

    msg.writeUInt8(17, 0);
    msg.writeUInt8(ANKI_VEHICLE_MSG_C2V_LIGHTS_PATTERN, 1);
    msg.writeUInt8(channelCount, 2);

    var j = 3;
    for (var i = 0; i < config.length && i <= 3; ++i) {
        var conf = config[i];
        var cycles = config.cycles ? config.cycles : 10;

        msg.writeUInt8(conf.channel, j++);
        msg.writeUInt8(conf.effect, j++);
        msg.writeUInt8(conf.start, j++);
        msg.writeUInt8(conf.end, j++);
        msg.writeUInt8(cycles, j++);
    }

    return this.sendMessage(msg);
}

/**
 * Returns the unique identifier of the vehicle
 *
 * @returns {String} Unique identifier of the vehicle
 */
Vehicle.prototype.getId = function () {
    return this._device.uuid;
}

/**
 * Returns the address of the vehicle.
 *
 * @returns {String} Address of the vehicle
 */
Vehicle.prototype.getAddress = function () {
    return this._device.address;
}

/**
 * Returns the current data of the vehicle.
 *
 * @returns {Object} data Current data of vehicle
 */
Vehicle.prototype.getData = function() {
    return this._data;
}

/**
 * Tries to send a message to the vehicle using the GATT write characteristic of BLE. Returns an
 * promise to handle errors while sending the data. By default sending is only possible after
 * establishing a connection, using the ´ignoreState´ flag will allow to send messages anyway
 * (e.g. initialization messages).
 *
 * @private
 * @param {Buffer} msg Message to send to the vehicle
 * @param {Boolean} ignoreState (optional) Allows sending messages before state turns to connected
 * @returns {Promise} State after successfully sending the message
 * @throws {Error} Error when sending messages without connecting before
 */
Vehicle.prototype.sendMessage = function (msg, ignoreState) {
    var me = this;

    if (!ignoreState && this._state === VEHICLE_STATE_DISCONNECTED) {
        throw new Error("Please connect to vehicle before sending messages.");
    }

    return new Promise(function (resolve, reject) {
        me._write.write(msg, false, function (err) {
            if (err) {
                reject(error);
            }
            resolve();
        });
    });
}

/**
 * Searches for a message with a specified id in the data event of the GATT read characteristic.
 * When a message was found it will be parsed by a ´msgParser´ function and send back using a
 * callback.
 *
 * @private
 * @param {Number} messageId  The id of the message
 * @param {Function} callback Callback function to handle the data
 * @param {Function} msgParser  Parser function to transform the message to readable data
 * @param {Boolean} (otpional) unique Defines if the message should be read once, default is false
 * @param {Buffer} msgParser.msg  msg Message to parse
 */
Vehicle.prototype.readMessage = function (messageId, callback, msgParser, unique) {
    var idAsInt = parseInt(messageId);
    var me = this;
    var u = unique ? unique : false;
    var listener = function (msg) {
        var id = msg.readUInt8(1);
        console.log(msg);
        if (id === idAsInt) {
            callback(msgParser(msg));
        }
        if (u) {
            setTimeout(function () {
                me._read.removeListener('data', listener);
            }, 1000);
        }
    };

    this._read.on('data', listener);
}

/**
 * Parses the ping message into a Integer value.
 *
 * @private
 * @param (Buffer) msg Raw ping message
 * @retrun {Integer} Ping between vehicle and operating system
 */
Vehicle.prototype.parsePingMessage = function (msg) {
    return msg.readUInt8(2);
}

/**
 * Parses the version message into a Integer value.
 *
 * @private
 * @param (Buffer) msg Raw version message
 * @retrun {Integer} Version of the vehicle
 */
Vehicle.prototype.parseVersionMessage = function (msg) {
    return msg.readUInt16LE(2);
}

/**
 * Parses the battery level message into a Integer value.
 *
 * @private
 * @param (Buffer) msg Raw battery level message
 * @retrun {Integer} Battery level of the vehicle
 */
Vehicle.prototype.parseBatteryLevelMessage = function (msg) {
    return msg.readUInt16LE(2);
}

/**
 * Parses the position update message into a JSON-Object.
 *
 * @private
 * @param {Buffer} msg Raw data of position update
 * @returns {Object} message of position update
 */
Vehicle.prototype.parseLocalizationPositionUpdateMessage = function (msg) {
    return {
        timestamp: new Date(),
        locationId: msg.readUInt8(2),
        pieceId: msg.readUInt8(3),
        offset: msg.readFloatLE(4),
        speed: msg.readUInt16LE(8),
        flags: msg.readUInt8(10)
        //TODO: if desired, last ack commands could be extended.
    };
}

/**
 * Parses the transition update message into a JSON-Object.
 *
 * @private
 * @param {Buffer} msg Raw data of transition update
 * @returns {Object} message of transition update
 */
Vehicle.prototype.parseLocalizationTransitionUpdateMessage = function (msg) {
    return {
        timestamp: new Date(),
        pieceId: msg.readUInt8(2),
        previousPieceId: msg.readUInt8(3),
        offset: msg.readFloatLE(4),
        direction: msg.readUInt8(8)
        //TODO: if desired, last ack commands could be extended.
        //TODO: if desired, track grade detection  could be extended.
        //TODO: if desired, wheel displacement (cm) since last transition  could be extended.
    };
}

/**
 * Parses the intersection update message into a JSON-Object.
 *
 * @private
 * @param {Buffer} msg Raw data of intersection update
 * @returns {Object} message of intersection update
 */
Vehicle.prototype.parseLocalizationIntersectionUpdateMessage = function (msg) {
    return {
        timestamp: new Date(),
        pieceId: msg.readUInt8(2),
        offset: msg.readFloatLE(3),
        direction: msg.readUInt8(7),
        code: msg.readUInt8(8),
        turn: msg.readUInt8(9),
        exiting: msg.readUInt8(10) === 1 ? true : false
    };
}

/**
 * Parses the offset from road center update message into a JSON-Object.
 *
 * @private
 * @param {Buffer} msg Raw data of intersection update
 * @returns {Object} message of offset from road center update
 */
Vehicle.prototype.parseOffsetFromRoadCenterUpdateMessage = function (msg) {
    return {
        timestamp: new Date(),
        pieceId: msg.readUInt8(2),
        offset: msg.readFloatLE(3),
        laneChangeId: msg.readUInt8(7)
    };
}

/**
 * Enables or disabled the SDK mode on the vehicle. Enabling this mode allows sending commands
 * to the vehicle. SDK mode will be enabled while connecting to the car.
 *
 * @private
 * @param {Boolean} on enables or disables SDK mode on the vehicle
 * @param {Number} flags (optional) TODO: Find out about this config.
 * @returns {Promise} State after enabling the SDK mode
 */
Vehicle.prototype.setSdkMode = function (on, flags) {
    var o = on ? 0x01 : 0x0;
    var f = flags || 0x01

    var msg = new Buffer(4);
    msg.writeUInt8(0x03, 0);
    msg.writeUInt8(0x90, 1);
    msg.writeUInt8(o, 2);
    msg.writeUInt8(f, 3);

    return this.sendMessage(msg, true);
}

Vehicle.prototype.toString = function () {
    return JSON.stringify(this.toJSON());
}

Vehicle.prototype.toJSON = function () {
    return {
        id: this.getId(),
        address: this.getAddress(),
        state: this._state === VEHICLE_STATE_CONNECTED ? "connected" : "disconnected"
    };
}

module.exports = Vehicle;

/*
Speed Update

This one is mostly irrelevant, since right now the cars are probably not going to change speed without being commanded to do so.

    ANKI_VEHICLE_MSG_V2C_SPEED_UPDATE = 0x36;
    typedef struct anki_vehicle_msg_speed_update {
    uint8_t     size;
    uint8_t     msg_id;
    uint16_t    speed_mm_per_sec;
} ATTRIBUTE_PACKED anki_vehicle_msg_speed_update_t;

Status Update

This message conveys some basic info about the vehicle, similar to what is in the advertisement packet, but this is sent once you are connected to a vehicle.

    ANKI_VEHICLE_MSG_V2C_STATUS_UPDATE = 0x3f;
typedef struct anki_vehicle_msg_status_update {
    uint8_t     size;
    uint8_t     msg_id;
    uint8_t     reserved0;
    uint8_t     on_charger;
    uint8_t     battery_low;
    uint8_t     battery_full;
} ATTRIBUTE_PACKED anki_vehicle_msg_status_update_t;*/
