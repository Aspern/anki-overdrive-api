"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GattProfile_1 = require("../message/GattProfile");
const CancelLaneChange_1 = require("../message/c2v/CancelLaneChange");
const ChangeLane_1 = require("../message/c2v/ChangeLane");
const SdkMode_1 = require("../message/c2v/SdkMode");
const BatteryLevelRequest_1 = require("../message/c2v/BatteryLevelRequest");
const Protocol_1 = require("../message/Protocol");
const MessageBuilder_1 = require("../message/MessageBuilder");
const PingRequest_1 = require("../message/c2v/PingRequest");
const VersionRequest_1 = require("../message/c2v/VersionRequest");
const SetOffsetFromRoadCenter_1 = require("../message/c2v/SetOffsetFromRoadCenter");
const SetSpeed_1 = require("../message/c2v/SetSpeed");
const Turn_1 = require("../message/c2v/Turn");
class Vehicle {
    constructor(device, offset = 0.0, name = "") {
        this._device = device;
        this.name = name;
        this._offset = offset;
        this.id = device.id;
        this.address = device.address;
        this._listeners = [];
        this._builder = new MessageBuilder_1.MessageBuilder();
    }
    cancelLaneChange() {
        this.writeAndPublish(new CancelLaneChange_1.CancelLaneChange(this.id));
    }
    changeLane(offset, speed = 300, acceleration = 300, hopIntent = 0x0, tag = 0x0) {
        this.writeAndPublish(new ChangeLane_1.ChangeLane(this.id, offset, speed, acceleration, hopIntent, tag));
    }
    connect() {
        const self = this;
        return new Promise((resolve, reject) => {
            self._device.connect(GattProfile_1.ANKI_STR_CHR_READ_UUID, GattProfile_1.ANKI_CHR_WRITE_UUID).then(() => {
                self.enableSdkMode();
                self._device.read((data) => self.readAndPublish(data));
                resolve(self);
            }).catch(reject);
        });
    }
    disableSdkMode() {
        this.writeAndPublish(new SdkMode_1.SdkMode(this.id, false));
    }
    disconnect() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.disableSdkMode();
            self.removeAllListeners();
            self._device.disconnect()
                .then(() => {
                resolve(self);
            }).catch(reject);
        });
    }
    enableSdkMode() {
        this.writeAndPublish(new SdkMode_1.SdkMode(this.id, true));
    }
    queryBatterLevel() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.sendRequest(new BatteryLevelRequest_1.BatteryLevelRequest(this.id), Protocol_1.ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE).then((message) => resolve(message.batteryLevel))
                .catch(reject);
        });
    }
    queryPing() {
        const self = this;
        return new Promise((resolve, reject) => {
            const request = new PingRequest_1.PingRequest(this.id);
            self.sendRequest(request, Protocol_1.ANKI_VEHICLE_MSG_V2C_PING_RESPONSE).then((message) => resolve(message.calculatePing(request)))
                .catch(reject);
        });
    }
    queryVersion() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.sendRequest(new VersionRequest_1.VersionRequest(this.id), Protocol_1.ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE).then((message) => resolve(message.version))
                .catch(reject);
        });
    }
    setOffset(offset) {
        this.writeAndPublish(new SetOffsetFromRoadCenter_1.SetOffsetFromRoadCenter(this.id, offset));
        this._offset = offset;
    }
    setSpeed(speed, acceleration = 500, limit = false) {
        this.writeAndPublish(new SetSpeed_1.SetSpeed(this.id, speed, acceleration, limit));
    }
    turnLeft() {
        this.writeAndPublish(new Turn_1.Turn(this.id, Turn_1.TurnType.VEHICLE_TURN_LEFT));
    }
    turnRight() {
        this.writeAndPublish(new Turn_1.Turn(this.id, Turn_1.TurnType.VEHICLE_TURN_RIGHT));
    }
    uTurn() {
        this.writeAndPublish(new Turn_1.Turn(this.id, Turn_1.TurnType.VEHICLE_TURN_UTURN));
    }
    uTurnJump() {
        this.writeAndPublish(new Turn_1.Turn(this.id, Turn_1.TurnType.VEHICLE_TURN_UTURN_JUMP));
    }
    addListener(listener) {
        this._listeners.push(listener);
    }
    get offset() {
        return this._offset;
    }
    removeListener(listener) {
        this._listeners = this._listeners.filter(l => listener !== l);
    }
    removeAllListeners() {
        this._listeners = [];
    }
    readAndPublish(payload) {
        const self = this;
        this._listeners.forEach(listener => listener(self._builder
            .messageId(payload.readUInt8(1))
            .vehicleId(self.id)
            .payload(payload)
            .build()));
    }
    writeAndPublish(message) {
        const self = this;
        this._device.write(message.payload).then(() => {
            self._listeners.forEach(listener => listener(message));
        });
    }
    sendRequest(request, responseId) {
        const self = this;
        return new Promise((resolve, reject) => {
            const listener = (message) => {
                if (message && message.payload.readUInt8(1) === responseId) {
                    clearTimeout(timeout);
                    self.removeListener(listener);
                    resolve(message);
                }
            };
            const timeout = setTimeout(() => {
                self.removeListener(listener);
                reject(new Error("Request timeout for " + responseId));
            }, 1500);
            self.addListener(listener);
            self.writeAndPublish(request);
        });
    }
}
exports.Vehicle = Vehicle;
