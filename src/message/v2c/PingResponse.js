"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractVehicleMessage_1 = require("../AbstractVehicleMessage");
class PingResponse extends AbstractVehicleMessage_1.AbstractVehicleMessage {
    constructor(vehicleId, payload) {
        super(vehicleId, payload);
    }
    calculatePing(request) {
        return this.timestamp.getMilliseconds()
            - request.timestamp.getMilliseconds();
    }
}
exports.PingResponse = PingResponse;
