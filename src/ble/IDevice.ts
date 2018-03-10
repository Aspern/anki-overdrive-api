/**
 * Represents a bluetooth device.
 *
 * @since 1.0.0
 */
interface IDevice {

    /**
     * Unique identifier for the device.
     */
    id: string

    /**
     * Address of the device.
     */
    address: string

    /**
     * Connects the device with the bluetooth network. Returns a promise that resolves with the connected device or
     * rejects with an error if the connection could not established.
     *
     * @param read Id of the read characteristic
     * @param write Id of the write characteristic
     * @returns Connected device
     */
    connect(read?: string, write?: string): Promise<IDevice>

    /**
     * Disconnects the devilce from the bluetooth network. Returns a promise that resolves the disconnected device
     * or rejects with an error if the disconnection fails.
     *
     * @returns Disconnected device
     */
    disconnect(): Promise<IDevice>

    /**
     * Adds a listener to the device that invokes if the device receives any data. The data is represented as a
     * byte buffer.
     *
     * @param listener Listener for data events
     * @param listener.data The events data
     */
    read(listener: (data: Buffer) => any): void

    /**
     * Writes data represented as byte buffer to a device. Returns a promise that resolves after the data has been
     * written successfully to the device or returns an error if the write was not successful.
     *
     * @param data Data to send as byte Buffer
     * @returns State of successful write
     */
    write(data: Buffer): Promise<void>

}

export {IDevice}