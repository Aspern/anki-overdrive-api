interface IDevice {
    id: string
    address: string

    connect(read?: string, write?: string): Promise<IDevice>

    disconnect(): Promise<IDevice>

    read(listener: (data: Buffer) => any): any

    write(data: Buffer): Promise<void>

    validate(serviceId: string): Promise<boolean>

}

export {IDevice}