import {AbstractVehicleMessage} from "../AbstractVehicleMessage"
import {PingRequest} from "../c2v/PingRequest"

class PingResponse extends AbstractVehicleMessage {

    public constructor(vehicleId: string, payload: Buffer) {
        super(vehicleId, payload)
    }

    public calculatePing(request: PingRequest): number {
        return this.timestamp.getMilliseconds()
            - request.timestamp.getMilliseconds()
    }

}

export {PingResponse}