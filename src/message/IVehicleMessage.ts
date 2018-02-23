interface IVehicleMessage {

    vehicleId: string
    timestamp: Date
    payload: Buffer
}

export {IVehicleMessage}