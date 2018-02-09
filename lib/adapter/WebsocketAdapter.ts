import {IAdapter} from "./IAdapter";
import {IVehicleScanner} from "../vehicle/IVehicleScanner";
import {connection, IMessage, server} from "websocket"
import * as log4js from "log4js"
import {Logger} from "log4js";
import * as http from "http"

type WebsocketCommand = "scan"

interface IWebsocketMessage {
    command: WebsocketCommand,
    vehicleId?: string
    payload?: any
}

class WebsocketAdapter implements IAdapter {

    private _scanner: IVehicleScanner
    private _server: server
    private _logger: Logger

    public constructor() {
        this._logger = log4js.getLogger()
        this._logger.level = "debug"
    }

    public install(scanner: IVehicleScanner): void {
        this._scanner = scanner
        this.createWebsocketServer()
    }

    get name(): string {
        return "WebsocketAdapter"
    }

    private createWebsocketServer(): void {
        const self = this

        const httpServer = http.createServer( (request, response) => {
            self._logger.warn("Invalid message from: " + request);
            response.writeHead(404);
            response.end();
        });

        httpServer.listen(4711)

        this._server = new server({
            httpServer,
            autoAcceptConnections: false
        })

        this._logger.info("Starting websocket at " + 4711)
        this._server.on("request", request  => {
            const connection = request.accept();
            connection.on("message", (message: IMessage) => this.onMessage(message, connection));
        })
    }

    private onMessage(message: IMessage, connection: connection) {
        try {
            if(message.type === "utf8" && message.utf8Data) {
                const websocketMessage = this.parseWebsocketMessage(message.utf8Data)
                this.handleWebsocketMessage(websocketMessage, connection)
            } else {
                this._logger.warn("Unknown message type '" + message.type + "'.")
            }
        } catch (error) {
            this._logger.error(error)
        }
    }

    private handleWebsocketMessage(message: IWebsocketMessage, connection: connection): void {
        switch (message.command) {
            case "scan":
                this.scanAndSendVehicles(message, connection)
                break
            default:
                this._logger.warn("Unknown command '" + message.command + "'.")
        }
    }

    private parseWebsocketMessage(message: string): IWebsocketMessage {
        return JSON.parse(message)
    }

    private scanAndSendVehicles(message: IWebsocketMessage, connection: connection): void {

        this._scanner.findAll().then(vehicles => {
            const payload = vehicles.map(vehicle => {
                return {
                    id: vehicle.id,
                    address: vehicle.address
                }
            })

            connection.send(
                JSON.stringify({
                    command: message.command,
                    vehicleId: message.vehicleId,
                    payload
                })
            )
        })
    }

}

export {WebsocketAdapter, IWebsocketMessage}