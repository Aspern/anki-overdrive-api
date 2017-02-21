import {isNullOrUndefined} from "util";
import {Vehicle} from "../vehicle/vehicle-interface";

/**
 * TODO: Missing documentation
 */
class AnkiConsole {

    private _commandHandler: (cmd: string, params: Array<any>, vehicle: string) => any = () => {
    };

    /**
     *
     * @param handler
     * @return {AnkiConsole}
     */
    onCommand(handler: (cmd: string, params: Array<string>, vehicle: string) => any): AnkiConsole {
        this._commandHandler = handler;
        return this;
    }

    /**
     * TODO: Missing documentation
     *
     * @param vehicles
     */
    initializePrompt(vehicles: Array<Vehicle>): void {
        const readline = require('readline');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'ANKI> '
        });
        rl.prompt();

        rl.on('line', (line: string) => {
            line = line.trim();
            let input: string[] = line.split(' ');
            let command = input[0];
            let index: number = parseInt(input[1]);
            let params = input.length > 2 ? input.splice(2, input.length - 1) : [];

            if (command === "help") {
                console.log('Available commands:\n' +
                    'c [carIndex] - connect to car\n' +
                    'd [carIndex] - disconnect from car\n' +
                    's [carIndex] [speed] [acceleration] - set speed and acceleration of car\n' +
                    'l [carIndex] [offset] - change lane to offset\n' +
                    'o [carIndex] [offset] - initialized car with offset\n' +
                    'u [carIndex] - u turn\n' +
                    'p [carIndex] - ping car\n' +
                    'b [carIndex] - battery level of car\n');
                return;
            }

            if (index < 0 || index > vehicles.length || isNullOrUndefined(index)) {
                console.log("car not found.");
                return;
            }

            this._commandHandler(command, params, vehicles[index].id);


            switch (command) {
                case 'c':
                    vehicles[index].connect().then(() => {
                        console.log("car connected");
                    });
                    break;
                case 's':
                    let speed: number = parseInt(params[0]);
                    let acceleration: number = parseInt(params[1]);
                    speed = isNullOrUndefined(speed) ? 200 : speed;
                    acceleration = isNullOrUndefined(acceleration) ? 50 : acceleration;
                    try {
                        vehicles[index].setSpeed(speed, acceleration);
                    }
                    catch (e) {
                        //  TODO:validate if this is really save, what if message changes?
                        if (e.message === "Cannot read property 'write' of undefined")
                            console.log("error. car is not connected!");
                    }
                    break;
                    // TODO: Other commands are not saved from unconnected vehicles => throw error.
                case 'o':
                    vehicles[index].setOffset(parseFloat(params[0]));
                    break;
                case 'l':
                    vehicles[index].changeLane(parseFloat(params[0]));
                    break;
                case 'u':
                    vehicles[index].uTurn();
                    break;
                case 'd':
                    vehicles[index].disconnect().then(() => {
                        console.log("car disconnected");
                    });
                    break;
                case 'p':
                    vehicles[index].queryPing().then((result) => {
                        isNullOrUndefined(result) ? console.log('no data, may be car not connected.') : console.log(result);
                    });
                    break;
                case 'b':
                    vehicles[index].queryBatteryLevel().then((result) => {
                        isNullOrUndefined(result) ? console.log('no data, may be car not connected.') : console.log(result);
                    });
                    break;
                default:
                    console.log('command not found');
                    break;
            }
            rl.prompt();
        }).on('close', () => {
            console.log('Good bye. Thank you for using Anki!');
            process.exit();
        });
    }
}

export {AnkiConsole}