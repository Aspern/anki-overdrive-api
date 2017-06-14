import {VehicleScannerImpl} from "../main/de.msg.iot.anki/core/vehicle/vehicle-scanner-impl";
import {Vehicle} from "../main/de.msg.iot.anki/core/vehicle/vehicle-interface";
import {JsonSettings} from "../main/de.msg.iot.anki/core/settings/json-settings";
import {TrackRunner} from "../core/util/track-runner";
import {ValidationReport} from "../core/util/validation-report";
import {PositionUpdateMessage} from "../core/message/v2c/position-update-message";

/************************************************************************************
 *                         MEASURE MESSAGE QUALITY                                  *
 *                                                                                  *
 *  Use any vehicle to measure the quality of the messages. Therefore put the       *
 *  vehicle on the middle of the start lanes and run the program. Please see the    *
 *  parameters for this case in the 'settings.json' file.                           *
 *                                                                                  *
 ************************************************************************************/

let settings = new JsonSettings(),
    setup = settings.getAsSetup("setup"),
    scanner = new VehicleScannerImpl(setup),
    track = settings.getAsTrack("track"),
    config: {
        minSpeed: number,
        maxSpeed: number,
        increment: number,
        rounds: number
    } = settings.getAsObject("utils").measureQuality,
    speedData: Array<number>,
    result: Array<QualityReport> = [],
    laneData: Array<[number, number]> = [];

class QualityReport {
    private _speed: number;
    private _avgCount: number;
    private _medianCount: number;
    private _avgErrorSpeed: number;
    private _medianErrorSpeed: number

    get speed(): number {
        return this._speed;
    }

    set speed(value: number) {
        this._speed = value;
    }

    get avgCount(): number {
        return this._avgCount;
    }

    set avgCount(value: number) {
        this._avgCount = value;
    }

    get medianCount(): number {
        return this._medianCount;
    }

    set medianCount(value: number) {
        this._medianCount = value;
    }


    get avgErrorSpeed(): number {
        return this._avgErrorSpeed;
    }

    set avgErrorSpeed(value: number) {
        this._avgErrorSpeed = value;
    }

    get medianErrorSpeed(): number {
        return this._medianErrorSpeed;
    }

    set medianErrorSpeed(value: number) {
        this._medianErrorSpeed = value;
    }
}

function createSpeedData(minSpeed: number, maxSpeed: number, increment: number): Array<number> {
    let data: Array<number> = [],
        speed = minSpeed;

    do {
        data.push(speed);
        speed += increment;
    } while (speed <= maxSpeed);

    return data;
}

function getPositionsForLane(lane: number) {
    let count = 0;

    track.eachPiece(piece => {
        count += piece.getLane(lane).length;
    });

    return count;
}

function calcAvg(data: Array<number>): number {
    let sum = 0;

    data.forEach(count => {
        sum += count;
    });

    return sum / data.length;
}

function calcMedian(data: Array<number>): number {
    data.sort((a, b) => {
        return a - b;
    });

    let half = Math.floor(data.length / 2);

    if (data.length % 2)
        return data[half];

    return (data[half - 1] + data[half]) / 2.0;
}

function collectMessages(vehicle: Vehicle, speed: number): Promise<QualityReport> {
    return new Promise<QualityReport>((resolve, reject) => {
        console.log("Collecting data for speed [" + speed + "]...");
        setTimeout(() => {
            let runner = new TrackRunner(vehicle, track, speed, speed, false, laneData)
                .setValidator((message, track, lane) => {
                    let report = new ValidationReport().setValid(),
                        uuids: Array<string> = [];

                    message.forEach(message => {
                        uuids.push("" + message.piece + message.location);
                    });

                    message.sort((a, b) => {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });

                    for (let i = 0; i < uuids.length - 1; ++i)
                        if (uuids[i] === uuids[i + 1])
                            report.setInvalid()
                                .setMessage("Vehicle collects message more then one time.");

                    return report;
                })
                .onTimeoutHandler(() => {
                    console.error("Timeout reached for searching lane!");
                    runner.stop();
                })
                .onStop((messages: Array<Array<PositionUpdateMessage>>, e: Error) => {
                    if (e)
                       console.error(e);

                    else {
                        let counts: Array<number> = [],
                            speedErrors: Array<number> = [],
                            expected = getPositionsForLane(15),
                            report: QualityReport = new QualityReport();

                        messages.forEach(lane => {
                            // Start message is counted twice.
                            counts.push(lane.length - 1);
                            lane.forEach(message => {
                                speedErrors.push(Math.abs(message.speed - message.lastDesiredSpeed));
                            });
                        });

                        report.speed = speed;
                        report.avgCount = calcAvg(counts) / expected;
                        report.medianCount = calcMedian(counts) / expected;
                        report.avgErrorSpeed = calcAvg(speedErrors);
                        report.medianErrorSpeed = calcMedian(speedErrors);

                        resolve(report);
                    }
                });
            runner.run();
        }, 2000);
    });
}

console.log("Searching for any vehicle...");
scanner.findAny().then(vehicle => {
    speedData = createSpeedData(
        config.minSpeed,
        config.maxSpeed,
        config.increment
    );

    console.log("Starting measure-message-quality with following parameters:");
    console.log("\trounds:\t\t" + config.rounds);
    console.log("\tspeeds:\t\t" + speedData);
    console.log("\tvehicle:\t" + vehicle.id);

    for (let i = 0; i < config.rounds; ++i)
        laneData.push([15, 68.0]);

    speedData.reduce((promise, speed) => {

        return promise.then((delta: Array<QualityReport>) => {
            return collectMessages(vehicle, speed).then((report: QualityReport) => {
                delta.push(report);
                return delta;
            });
        });

    }, Promise.resolve(result)).then(() => {
        console.log("Finished measure-message-quality with following results:");
        result.forEach(report => {
            console.log(
                report.speed + "\t"
                + report.avgCount.toLocaleString() + "\t"
                + report.medianCount.toLocaleString() + "\t"
                + report.avgErrorSpeed.toLocaleString() + "\t"
                + report.medianErrorSpeed.toLocaleString()
            );
        });
        process.exit(0);
    }).catch(e => {
        console.error(e);
        process.exit(0);
    });


}).catch(e => {
    console.error(e);
    process.exit(0);
});

