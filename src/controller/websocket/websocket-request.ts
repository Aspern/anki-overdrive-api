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
    command: Command;
    vehicleId: string;
    params: Array<number>
}

export {WebSocketRequest, Command};