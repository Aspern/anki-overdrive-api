import {suite, test, timeout} from "mocha-typescript";
import {WebSocketController} from "../../src/controller/websocket/websocket-controller";
import {VehicleScannerImpl} from "../../src/core/vehicle/vehicle-scanner-impl";
import {JsonSettings} from "../../src/core/settings/json-settings";
import * as log4js from "log4js";
import {WebSocketRequest} from "../../src/controller/websocket/websocket-request";

@suite
class WebSocketTest {

    static _CONTROLLER: WebSocketController;
    static _PORT = 4711;

    @timeout(10000)
    static before(done) {
        log4js.configure({
            appenders: [
                {type: 'console'},
                {type: 'file', filename: 'logs/setup.log', category: 'setup'}
            ]
        });

        let settings = new JsonSettings(),
            setup = settings.getAsSetup("setup"),
            scanner = new VehicleScannerImpl(setup);

        scanner.findAll().then(vehicles => {
            WebSocketTest._CONTROLLER = new WebSocketController(
                vehicles,
                WebSocketTest._PORT
            );
            setTimeout(() => {
                done();
            }, 5000)

        });
    }

    @test @timeout(10000) "connect and disconnect"(done) {
        let WebSocketClient = require("websocket").client;

        let client = new WebSocketClient();

        client.on('connect', connection => {
            connection.on('error', error => {
               done(error);
            });
            if(connection.connected) {
                let request : WebSocketRequest = {
                    command: "connect",
                    params : [],
                    vehicleId : "ed0c94216553"
                }
                connection.sendUTF(JSON.stringify(request));
                done();
            }

        });

        client.connect('ws://localhost:' + WebSocketTest._PORT + "/", 'echo-protocol');
    }


}
