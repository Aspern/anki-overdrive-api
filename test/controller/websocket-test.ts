import {suite, timeout, test} from "mocha-typescript";
import {WebSocketController} from "../../src/controller/websocket/websocket-controller";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {JsonSettings} from "../../src/core/settings/json-settings";
import {WebSocketRequest} from "../../src/controller/websocket/websocket-request";
import * as log4js from "log4js";

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
            scanner = new VehicleScanner(setup);

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
        let WebSocket = require("websocket").w3cwebsocket;

        let client = new WebSocket('ws://localhost:' + WebSocketTest._PORT + "/", 'echo-protocol');

        client.onerror = function() {
            console.error('Connection Error');
        };

        client.onopen = function() {
            console.log('WebSocket Client Connected');

            function sendNumber() {
                if (client.readyState === client.OPEN) {
                    var number = Math.round(Math.random() * 0xFFFFFF);
                    client.send(number.toString());
                    setTimeout(sendNumber, 1000);
                }
            }
            sendNumber();
        };
    }


}
