import {expect} from "chai"
import {MessageBuilder} from "../../../lib/message/MessageBuilder";
import {
    ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE,
    ANKI_VEHICLE_MSG_V2C_PING_RESPONSE,
    ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED,
    ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
} from "../../../lib/message/Protocol";
import {BatteryLevelResponse} from "../../../lib/message/v2c/BatteryLevelResponse";
import {VersionResponse} from "../../../lib/message/v2c/VersionResponse";
import {PingResponse} from "../../../lib/message/v2c/PingResponse";
import {VehicleDelocalizedUpdate} from "../../../lib/message/v2c/VehicleDelocalizedUpdate";
import {LocalizationPositionUpdate} from "../../../lib/message/v2c/LocalizationPositionUpdate";
import {LocalizationTransitionUpdate} from "../../../lib/message/v2c/LocalizationTransitionUpdate";
import {LocalizationIntersectionUpdate} from "../../../lib/message/v2c/LocalizationIntersectionUpdate";

describe("MessageBuilder", () => {

    describe("messageId", () => {

        it("is chainable", () => {
            const builder = new MessageBuilder()

            expect(builder.messageId(1)).to.equal(builder)
        })

    })

    describe("payload", () => {

        it("is chainable", () => {
            const builder = new MessageBuilder()

            expect(builder.payload(Buffer.alloc(0))).to.equal(builder)
        })

    })

    describe("vehicleId", () => {

        it("is chainable", () => {
            const builder = new MessageBuilder()

            expect(builder.vehicleId("4711")).to.equal(builder)
        })

    })

    describe("build", () => {

        it("returns undefined for unknown message ids", () => {
            const builder = new MessageBuilder()

            expect(builder.build()).to.be.undefined
        })

        it("can build battery level responses", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(4)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(BatteryLevelResponse)
        })

        it("can build version responses", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(4)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(VersionResponse)
        })

        it("can build ping responses", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(4)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_PING_RESPONSE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(PingResponse)
        })

        it("can build vehicle delocalized update", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(4)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(VehicleDelocalizedUpdate)
        })

        it("can build localization position update", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(20)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(LocalizationPositionUpdate)
        })

        it("can build localization transition update", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(20)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(LocalizationTransitionUpdate)
        })

        it("can build localization intersection update", () => {
            const builder = new MessageBuilder()
            const payload = Buffer.alloc(20)
            const message = builder.messageId(ANKI_VEHICLE_MSG_V2C_LOCALIZATION_INTERSECTION_UPDATE)
                .payload(payload)
                .build()

            expect(message).is.instanceOf(LocalizationIntersectionUpdate)
        })


    })

})