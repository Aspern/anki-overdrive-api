import {Command} from "./websocket-request";

interface WebSocketResponse {
    command: Command;
    vehicleId: string;
    payload: any;
}

export {WebSocketResponse};