import {Vehicle} from "../../core/vehicle/vehicle-interface";
import  {connection, IMessage, server} from "websocket";
import http = require('http');
import {Command, WebSocketRequest} from "./websocket-request";
import {isNullOrUndefined} from "util";
import {VehicleMessage} from "../../core/message/vehicle-message";

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

    constructor(vehicles: Array<Vehicle>, port: number) {
        let me = this;
        vehicles.forEach(vehicle => {
            me._store[vehicle.id] = {vehicle: vehicle, listener: null};
        });
        this._port = port;
        let httpServer = http.createServer(function (request, response) {
            //TODO (Logging): Inform about illegal incoming messages.
            response.writeHead(404);
            response.end();
        });
        this._server = new server({
            httpServer: httpServer,
            autoAcceptConnections: false
        });
        this._server.on('request', request => {
            //TODO (Security): Add origin validation.
            let connection = request.accept('echo-protocol', request.origin);
            connection.on('message', this.handleRequest);
        });
    }

    private handleRequest(message: IMessage) {
        if (message.type === 'utf-8') {
            //TODO: (Logging): Inform about incoming messages.
            try {
                let request = JSON.parse(message.utf8Data);
                this.handleMessage(request, connection);
            } catch (e) {
                //TODO (Logging): Inform about errors while parsing.
            }
        } else if (message.type === 'binary') {
            //TODO: (Logging): Inform about incoming messages.
        } else {
            //TODO (Logging): Inform about unknown type.
        }
    }

    private handleMessage(request: WebSocketRequest, connection: connection) {
        let me = this,
            vehicle = me._store[request.vehicleId].vehicle,
            params: Array<number> = request.params;


        if (isNullOrUndefined(vehicle)) {
            //TODO (Error): Handle if vehicle doesn't exist.
        }

        try {
            switch (request.command) {
                case "connect":
                    if (!vehicle.connected)
                        vehicle.connect()
                            .catch(/*TODO (Error): Handle*/);
                    break;
                case "disconnect":
                    if (vehicle.connected)
                        vehicle.disconnect()
                            .catch(/*TODO (Error): Handle*/);
                    break;
                case "accelerate":
                    vehicle.accelerate(params[0], params.length > 1 ? params[1] : 0.1);
                    break;
                case "brake":
                    vehicle.brake(params.length > 0 ? params[0] : 0.1);
                    break;
                case "cancel-lane-change":
                    vehicle.cancelLaneChange();
                    break;
                case "change-lane":
                    vehicle.changeLane(
                        params[0],
                        params.length > 1 ? params[1] : params[0],
                        params.length > 2 ? params[2] : params[0]
                    );
                    break;
                case "query-battery-level":
                    vehicle.queryBatteryLevel()
                        .then(batteryLevel => {
                            me.sendResponse("query-battery-level", vehicle.id, connection, {
                                batteryLevel: batteryLevel
                            });
                        }).catch(/*TODO (Error): Handle*/);
                    break;
                case "query-ping":
                    vehicle.queryPing()
                        .then(ping => {
                            me.sendResponse("query-ping", vehicle.id, connection, {
                                ping: ping
                            });
                        }).catch(/*TODO (Error): Handle*/);
                    break;
                case "query-version":
                    vehicle.queryVersion()
                        .then(version => {
                            me.sendResponse("query-version", vehicle.id, connection, {
                                version: version
                            });
                        }).catch(/*TODO (Error): Handle*/);
                    break;
                case "u-turn":
                    vehicle.uTurn();
                    break;
                case "set-offset":
                    vehicle.setOffset(params[0]);
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
                //TODO (Error,Logging): Invalid command was sent.
            }
        } catch (e) {
            //TODO (Logging, Error): Inform about errors while executing command.
        }
    }

    private sendResponse(command: Command, vehicleId: string, connection: connection, payload?: any) {
        //TODO (Implement)
    }
}

export {WebSocketController}