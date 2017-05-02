import {Vehicle} from "../../core/vehicle/vehicle-interface";
import {connection, IMessage, server} from "websocket";
import {Command, WebSocketRequest} from "./websocket-request";
import {isNullOrUndefined} from "util";
import {VehicleMessage} from "../../core/message/vehicle-message";
import {WebSocketResponse} from "./websocket-response";
import * as log4js from "log4js";
import http = require('http');
import logger = Handlebars.logger;

/**
 * This class uses a WebSocket to control vehicles. Therefore a HTTP-Server is started for each
 * vehicle using an individual port.
 */
class WebSocketController {

    private _store: {
        [key: string]: {
            vehicle: Vehicle,
            listener: (message: VehicleMessage) => any
        }
    } = {};
    private _port: number;
    private _server: server;
    private _logger: log4js.Logger;

    constructor(vehicles: Array<Vehicle>, port: number) {
        let me = this;
        me._logger = log4js.getLogger("websocket");
        vehicles.forEach(vehicle => {
            me._store[vehicle.id] = {vehicle: vehicle, listener: null};
        });
        this._port = port;
        let httpServer = http.createServer(function (request, response) {
            me._logger.warn("Invalid message from: " + request);
            response.writeHead(404);
            response.end();
        });
        httpServer.listen(port, () => {
            me._logger.info("HTTP Server listening on port: " + port);
        });
        this._server = new server({
            httpServer: httpServer,
            autoAcceptConnections: false
        });
        this._server.on('request', request => {
            //TODO (Security): Add origin validation.
            let connection = request.accept('echo-protocol', request.origin);
            connection.on('message', (message: IMessage) => this.handleRequest(message, connection));
        });
        this._logger.info("Started WebSocket on: " + port);
    }

    private handleRequest(message: IMessage, connection: connection) {
        let me = this,
            logger = me._logger;
        if (message.type === 'utf8') {
            for (let key in message)
                if (message.hasOwnProperty(key)) {
                    let data: any = message;
                    let value: any = data[key];
                    logger.info(key + ": " + value);
                }
            logger.info("Incoming UTF-8 message: " + message);
            try {
                let request = JSON.parse(message.utf8Data);
                this.handleMessage(request, connection);
            } catch (e) {
                logger.error("Unable ot parse request", e);
            }
        } else if (message.type === 'binary') {
            logger.info("Incoming binary message: " + message);
        } else {
            logger.warn("Unknown message type: " + (message.type || message));
        }
    }

    private handleMessage(request: WebSocketRequest, connection: connection) {
        let me = this,
            logger = me._logger,
            data = request.data,
            vehicle = me._store[data.vehicleId].vehicle,
            payload = data.payload;

        if (isNullOrUndefined(vehicle)) {
            logger.warn("vehicle with id [" + data.vehicleId + "] does not exist in setup");
            // TODO (Error): Maybe inform client about state?
            return;
        }

        try {
            switch (data.command) {
                case "connect":
                    if (!vehicle.connected)
                        vehicle.connect()
                            .catch(logger.error);
                    break;
                case "disconnect":
                    if (vehicle.connected)
                        vehicle.disconnect()
                            .catch(logger.error);
                    break;
                case "accelerate":
                    vehicle.accelerate(payload.speed);
                    break;
                case "brake":
                    vehicle.brake();
                    break;
                case "set-speed":
                    vehicle.setSpeed(
                        payload.speed,
                        payload.acceleration || 300
                    );
                    break;
                case "cancel-lane-change":
                    vehicle.cancelLaneChange();
                    break;
                case "change-lane":
                    vehicle.changeLane(
                        payload.offset
                    );
                    break;
                case "query-battery-level":
                    vehicle.queryBatteryLevel()
                        .then(batteryLevel => {
                            me.sendResponse("query-battery-level", vehicle.id, connection, {
                                batteryLevel: batteryLevel
                            });
                        }).catch(logger.error);
                    break;
                case "query-ping":
                    vehicle.queryPing()
                        .then(ping => {
                            me.sendResponse("query-ping", vehicle.id, connection, {
                                ping: ping
                            });
                        }).catch(logger.error);
                    break;
                case "query-version":
                    vehicle.queryVersion()
                        .then(version => {
                            me.sendResponse("query-version", vehicle.id, connection, {
                                version: version
                            });
                        }).catch(logger.error);
                    break;
                case "u-turn":
                    vehicle.uTurn();
                    break;
                case "set-offset":
                    vehicle.setOffset(payload.offset);
                    break;
                case "enable-listener":
                    if (isNullOrUndefined(me._store[vehicle.id].listener)) {
                        me._store[vehicle.id].listener = (message: VehicleMessage) => {
                            me.sendResponse("enable-listener", vehicle.id, connection, message);
                        }
                        vehicle.addListener(me._store[vehicle.id].listener);
                    }
                    break;
                case "disable-listener":
                    if (!isNullOrUndefined(me._store[vehicle.id].listener)) {
                        vehicle.removeListener(me._store[vehicle.id].listener);
                        me._store[vehicle.id].listener = null;
                    }
                    break;
                default:
                    logger.warn("Invalid command: " + data.command);
            }
        } catch (e) {
            logger.error("Errors while executing/reading command" + e);
        }
    }

    private sendResponse(command: Command, vehicleId: string, connection: connection, payload?: any) {
        let response: WebSocketResponse = {
            command: command,
            vehicleId: vehicleId,
            payload: payload
        };
        connection.sendUTF(
            JSON.stringify(response, (key, value) => {
                if (key === '_data')
                    return undefined;
                return value;
            }).replace(/_/g, "")
        );
    }
}

export {WebSocketController}