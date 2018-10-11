interface IVehicleMessage {

    vehicleId: string
    timestamp: Date
    payload: Buffer

    toJsonString(): string
}

export {IVehicleMessage}