type Command = "connect"
    | "disconnect"
    | "set-offset"
    | "set-speed"
    | "change-lane"
    | "cancel-lane-change"
    | "u-turn"
    | "query-ping"
    | "query-version"
    | "query-battery-level"
    | "brake"
    | "accelerate"
    | "enable-listener"
    | "disable-listener"

interface WebSocketRequest {
    event: string,
    data: {
        command: Command;
        vehicleId: string;
        payload: any
    }
}

export {WebSocketRequest, Command};