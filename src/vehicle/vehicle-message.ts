const enum MessageIds {
    DISCONNECT = 0x0d,
    PING_REQUEST = 0x16,
    PING_RESPONSE = 0x17,
    VERSION_REQUEST = 0x18,
    VERSION_RESPONSE = 0x19,
    BATTERY_LEVEL_REQUEST = 0x1a,
    BATTERY_LEVEL_RESPONSE = 0x1b,
    SET_LIGHTS = 0x1d,
    SET_SPEED = 0x24,
    CHANGE_LANE = 0x25,
    CANCEL_LANE_CHANGE = 0x26,
    TURN = 0x32,
    LOCALIZATION_POSITION_UPDATE = 0x27,
    LOCALIZATION_TRANSITION_UPDATE = 0x29,
    LOCALIZATION_INTERSECTION_UPDATE = 0x2a,
    VEHICLE_DELOCALIZED = 0x2b,
    SET_OFFSET_FROM_ROAD_CENTER = 0x2c,
    OFFSET_FROM_ROAD_CENTER_UPDATE = 0x2d,
    LIGHTS_PATTERN = 0x33,
    CONFIG_PARAMS = 0x45,
    SDK_MODE = 0x90,
}

const enum TurnTypes {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UTURN = 3,
    UTURN_JUMP = 4
}

const enum TurnTriggers {
    IMMEDIATE = 0,
    INTERSECTION = 1
}

const enum LaneOffsets {
    LANE_1 = -68.0,
    LANE_2 = -23.0,
    CENTER = 0.0,
    LANE_3 = 23.0,
    LANE_4 = 68.0
}

const enum DrivingDirections {
    FORWARD = 0,
    REVERSE = 1
}

const enum IntersectionCodes {
    ENTRY_FIRST = 0,
    EXIT_FIRST = 1,
    ENTRY_SECOND = 2,
    EXIT_SECOND = 3
}


class VehicleMessage {

    id: number;
    size: number;
    payload: Buffer;
    timestamp: Date;

    protected constructor(message?: Buffer, id?: number, size?: number) {
        if (message) {
            this.payload = message;
            this.timestamp = new Date();
            this.size = message.readInt8(0);
            this.id = message.readUInt8(1);
        } else if (id && size) {
            this.payload = new Buffer(size + 1);
            this.payload.writeUInt8(size, 0);
            this.payload.writeUInt8(id, 1);
        }
    }

}

class PingResponseMessage extends VehicleMessage {

    ping: number;

    constructor(data: Buffer) {
        super(data);
        this.ping = this.payload.readInt8(2);
    }
}

class PingRequestMessage extends VehicleMessage {

    constructor() {
        super(null, MessageIds.PING_REQUEST, 1);
    }
}

class VersionResponseMessage extends VehicleMessage {

    version: number;

    constructor(data: Buffer) {
        super(data);
        this.version = this.payload.readUInt16LE(2);
    }
}

class VersionRequestMessage extends VehicleMessage {

    constructor() {
        super(null, MessageIds.VERSION_REQUEST, 1);
    }
}

class BatteryResponseMessage extends VehicleMessage {

    batteryLevel: number;

    constructor(data: Buffer) {
        super(data);
        this.batteryLevel = data.readUInt16LE(2);
    }
}

class BatteryRequestMessage extends VehicleMessage {

    constructor() {
        super(null, MessageIds.BATTERY_LEVEL_REQUEST, 1);
    }
}

class SdkModeMessage extends VehicleMessage {

    constructor(on: boolean) {
        super(null, MessageIds.SDK_MODE, 3);
        this.on(on)
            .flags(0x01);
    }

    on(on: boolean): SdkModeMessage {
        this.payload.writeUInt8(on ? 0x1 : 0x0, 2);
        return this;
    }

    flags(flags: number): SdkModeMessage {
        this.payload.writeUInt8(flags, 3);
        return this;
    }
}

class SetSpeedMessage extends VehicleMessage {

    constructor(speed: number,) {
        super(null, MessageIds.SET_SPEED, 6);
        this.speed(speed)
            .acceleration(500)
            .respectRoadPieceSpeedLimit(false);
    }

    speed(speed: number): SetSpeedMessage {
        this.payload.writeUInt16LE(speed, 2);
        return this;
    }

    acceleration(acceleration: number): SetSpeedMessage {
        this.payload.writeUInt16LE(acceleration, 4);
        return this;
    }

    respectRoadPieceSpeedLimit(respect: boolean): SetSpeedMessage {
        this.payload.writeUInt8(respect ? 0x01 : 0x0, 6);
        return this;
    }
}

class TurnMessage extends VehicleMessage {

    constructor(type: TurnTypes) {
        super(null, MessageIds.TURN, 3);
        this.type(type)
            .immediate();
    }

    none(): TurnMessage {
        return this.type(TurnTypes.NONE);
    }

    left(): TurnMessage {
        return this.type(TurnTypes.LEFT);
    }

    right(): TurnMessage {
        return this.type(TurnTypes.RIGHT);
    }

    uTurn(): TurnMessage {
        return this.type(TurnTypes.UTURN);
    }

    uTurnJump(): TurnMessage {
        return this.type(TurnTypes.UTURN_JUMP);
    }

    immediate(): TurnMessage {
        return this.trigger(TurnTriggers.IMMEDIATE);
    }

    intersection(): TurnMessage {
        return this.trigger(TurnTriggers.INTERSECTION)
    }

    private trigger(trigger: TurnTriggers): TurnMessage {
        this.payload.writeUInt8(trigger, 3);
        return this;
    }

    private type(type: TurnTypes): TurnMessage {
        this.payload.writeUInt8(type, 2);
        return this;
    }
}

class SetOffsetFromRoadCenterMessage extends VehicleMessage {

    constructor(lane?: LaneOffsets) {
        super(null, MessageIds.SET_OFFSET_FROM_ROAD_CENTER, 5);
        this.offsetFromRoadCenter(lane ? lane : LaneOffsets.CENTER);
    }

    offsetFromRoadCenter(offset: number): SetOffsetFromRoadCenterMessage {
        this.payload.writeFloatLE(offset, 2);
        return this;
    }

}

class ChangeLaneMessage extends VehicleMessage {

    constructor(lane?: LaneOffsets) {
        super(null, MessageIds.CHANGE_LANE, 11);
        this.offsetFromRoadCenter(lane ? lane : LaneOffsets.CENTER)
            .horizontalSpeed(500)
            .horizontalAcceleration(500);
    }

    horizontalSpeed(speed: number): ChangeLaneMessage {
        this.payload.writeInt16LE(speed, 2);
        return this;
    }

    horizontalAcceleration(acceleration: number): ChangeLaneMessage {
        this.payload.writeInt16LE(acceleration, 4);
        return this;
    }

    offsetFromRoadCenter(offset: number): ChangeLaneMessage {
        this.payload.writeFloatLE(offset, 6);
        return this;
    }

    hopIntent(hopIntent: number): ChangeLaneMessage {
        this.payload.writeUInt8(hopIntent, 10);
        return this;
    }

    tag(tag: number): ChangeLaneMessage {
        this.payload.writeUInt8(tag, 11);
        return this;
    }
}

class CancelLaneChangeMessage extends VehicleMessage {

    constructor() {
        super(null, MessageIds.CANCEL_LANE_CHANGE, 1);
    }
}

class LocalizationPositionUpdateMessage extends VehicleMessage {

    location: number;
    piece: number;
    offset: number;
    speed: number;
    flags: number;
    lastLaneChangeCmd: number;
    lastExecLaneChangeCmd: number;
    lastDesiredHorizontalSpeed: number;
    lastDesiredSpeed: number;

    constructor(data: Buffer) {
        super(data);
        this.size = data.readInt8(0);
        this.id = data.readInt8(1);
        this.location = data.readInt8(2);
        this.piece = data.readInt8(3);
        this.offset = data.readFloatLE(4);
        this.speed = data.readInt16LE(8);
        this.flags = data.readInt8(10);
        this.lastLaneChangeCmd = data.readInt8(11);
        this.lastExecLaneChangeCmd = data.readInt8(12);
        this.lastDesiredHorizontalSpeed = data.readUInt16LE(13);
        this.lastDesiredSpeed = data.readUInt16LE(15);
    }
}

class LocalizationTransitionUpdateMessage extends VehicleMessage {

    piece: number;
    prevPiece: number;
    offset: number;
    direction: DrivingDirections;
    lastLaneChangeCmd: number;
    lastExecLaneChangeCmd: number;
    lastDesiredHorizontalSpeed: number;
    lastDesiredSpeed: number;
    upHillCounter: number;
    downHillCounter: number;
    leftWheelDistance: number;
    rightWheelDistance: number;

    constructor(data: Buffer) {
        super(data);
        this.piece = data.readUInt8(2);
        this.prevPiece = data.readUInt8(3);
        this.offset = data.readFloatLE(4);
        this.direction = data.readInt8(8);
        this.lastLaneChangeCmd = data.readInt8(9);
        this.lastExecLaneChangeCmd = data.readInt8(10);
        this.lastDesiredHorizontalSpeed = data.readUInt16LE(11);
        this.lastDesiredSpeed = data.readUInt16LE(13);
        this.upHillCounter = data.readInt8(15);
        this.downHillCounter = data.readInt8(16);
        this.leftWheelDistance = data.readInt8(17);
        this.rightWheelDistance = data.readInt8(18);
    }
}

class LocalizationIntersectionUpdateMessage extends VehicleMessage {

    piece: number;
    offset: number;
    direction: DrivingDirections;
    code: IntersectionCodes;
    turn: number;
    exiting: boolean;

    constructor(data: Buffer) {
        super(data);
        this.piece = data.readInt8(2);
        this.offset = data.readFloatLE(3);
        this.direction = data.readUInt8(7);
        this.code = data.readInt8(8);
        this.turn = data.readInt8(9);
        this.exiting = data.readInt8(10) === 1;
    }
}

class OffsetFromRoadCenterUpdateMessage extends VehicleMessage {

    offset: number;
    laneChangeId: number;

    constructor(data: Buffer) {
        super(data);
        this.offset = data.readFloatLE(2);
        this.laneChangeId = data.readInt8(6);
    }
}


export {
    MessageIds,
    TurnTypes,
    TurnTriggers,
    LaneOffsets,
    VehicleMessage,
    PingResponseMessage,
    PingRequestMessage,
    VersionResponseMessage,
    VersionRequestMessage,
    BatteryResponseMessage,
    BatteryRequestMessage,
    SdkModeMessage,
    SetSpeedMessage,
    TurnMessage,
    SetOffsetFromRoadCenterMessage,
    ChangeLaneMessage,
    CancelLaneChangeMessage,
    LocalizationPositionUpdateMessage,
    LocalizationTransitionUpdateMessage,
    LocalizationIntersectionUpdateMessage,
    OffsetFromRoadCenterUpdateMessage
};
