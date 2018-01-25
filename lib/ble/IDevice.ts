interface IDevice {
    id: string
    address: string

    connect(): Promise<IDevice>

    disconnect(): Promise<IDevice>

    validate(serviceId: string): Promise<boolean>

}

export {IDevice}