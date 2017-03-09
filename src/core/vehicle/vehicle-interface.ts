import {VehicleMessage} from "../message/vehicle-message";
import {LightConfig} from "./light-config";

/**
 * Provides methods to interact with a vehicle.
 */
interface Vehicle {

    id: string;
    address: string;

    /**
     * Connects the vehicle via BLE.
     *
     * @return {Promise<Vehicle>|Promise} Promise holding the connected vehicle.
     */
    connect(): Promise<Vehicle>;

    /**
     * Disconnects the vehicle via BLE.
     *
     * @return {Promise<Vehicle>|Promise} Promise holding the disconnected vehicle.
     */
    disconnect(): Promise<Vehicle>;

    /**
     * Sets the speed of the vehicle.
     *
     * @param speed The requested vehicle speed in mm/sec.
     * @param acceleration The acceleration in mm/sec^2.
     */
    setSpeed(speed: number, acceleration?: number): void;

    /**
     * Sets the offset from road center of the vehicle.
     *
     * This value is stored internally in the vehicle and is used during a lane change request
     * to determine the target location. In the current version of the SDK, this message is
     * always sent to set the current offset to zero before a lane change message. This allows
     * the lane change to control the relative horizontal movement of the vehicle.
     *
     * @param offset The offset from the road center in mm.
     */
    setOffset(offset: number): void;

    /**
     * Moves the vehicle between the offset. The vehicle must be moving to execute this command.
     *
     * @param offset The target offset from the road center in mm.
     * @param speed The horizontal speed at for the lane change in mm/sec.
     * @param acceleration The horizontal acceleration for the lane change in mm/sec.
     */
    changeLane(offset: number, speed?: number, acceleration?: number): void;

    /**
     * Cancel the current lane change.
     */
    cancelLaneChange(): void;

    /**
     * Turns the vehicle left.
     */
    turnLeft(): void;

    /**
     * Turns the vehicle right.
     */
    turnRight(): void;

    /**
     * Executes an u-turn on the vehicle.
     */
    uTurn(): void;

    /**
     * Executes an u-turn with jump on the vehicle.
     */
    uTurnJump(): void;

    /**
     * Enables or disables the SDK mode.
     *
     * @param on Whether to turn SDK mode on (true) or off (false).
     */
    setSdkMode(on: boolean): void;

    /**
     * Queries for the vehicle's ping.
     *
     * @return {Promise<number>|Promise} Promise holding ping.
     */
    queryPing(): Promise<number>;

    /**
     * Queries for the vehicle's version.
     *
     * @return {Promise<number>|Promise} Promise holding version.
     */
    queryVersion(): Promise<number>;

    /**
     * Queries for the vehc's batter level.
     *
     * @return {Promise<number>|Promise} Promise holding battery level.
     */
    queryBatteryLevel(): Promise<number>;

    /**
     * Adds a listener to the vehc enrich events. Each listener can contain a filter on
     * special message types.
     *
     * @param listener The listener function.
     * @param listener.message Message from vehicle.
     * @param filer Any type of VehicleMessage.
     */
    addListener(listener: (message: VehicleMessage) => any, filer?: any): void;

    /**
     * Removes a listener from the vehicle.
     *
     * @param listener The listener function.
     */
    removeListener(listener: (message: VehicleMessage) => any): void;

    /**
     * Sets the lights of the vehicle. There can be used three config objects once.
     *
     * @param config
     */
    setLights(config: LightConfig | Array<LightConfig>): void;


}

export {Vehicle}
