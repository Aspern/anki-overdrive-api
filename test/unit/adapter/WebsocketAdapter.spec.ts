import {expect} from "chai"
import {IWebsocketMessage, WebsocketAdapter} from "../../../lib/adapter/WebsocketAdapter";
import {VehicleScanner} from "../../../lib/vehicle/VehicleScanner";
import {BluetoothMock} from "../../mock/BluetoothMock";
import {DeviceMock} from "../../mock/DeviceMock";
import {client} from "websocket"

function sendMessage(message: IWebsocketMessage): Promise<IWebsocketMessage> {
    return new Promise<IWebsocketMessage>((resolve, reject) => {
        const websocket = new client()

        websocket.on("connect", connection => {
            connection.on("message", message => {
                try {
                    if (message.type === "utf8" && message.utf8Data) {
                        const response: IWebsocketMessage = JSON.parse(message.utf8Data)
                        resolve(response)
                    } else {
                        reject(new Error("Unknown message type"))
                    }
                } catch (error) {
                    reject(error)
                }
            })
            connection.sendUTF(JSON.stringify(message))
        })

        websocket.connect("ws://localhost:4711", "echo-protocol")
    })
}

describe("WebsocketAdapter", () => {

    it("has correct name", () => {
        const adapter = new WebsocketAdapter()

        expect(adapter.name).to.equals("WebsocketAdapter")
    })

    describe("scan", () => {

        it("scans and sends all vehicles", (done) => {
            const scanner = new VehicleScanner(new BluetoothMock([
                new DeviceMock("1", "aa:bb:cc"),
                new DeviceMock("2", "dd:ee:ff")
            ]))
            const adapter = new WebsocketAdapter()
            adapter.install(scanner)

            sendMessage({command: "scan"}).then(response => {
                expect(response.command).to.equals("scan")
                expect(response.payload).to.instanceof(Array)
                expect(response.payload.length).to.equals(2)
                expect(response.payload[0].id).to.equals("1")
                expect(response.payload[0].address).to.equals("aa:bb:cc")
                expect(response.payload[1].id).to.equals("2")
                expect(response.payload[1].address).to.equals("dd:ee:ff")
                done()
            })
        })

    })

})