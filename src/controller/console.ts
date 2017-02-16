import {isNullOrUndefined} from "util";
import {Vehicle} from "../core/vehicle/vehicle-interface";

class AnkiConsole {

    private _commandHandler: (cmd: string, params: Array<any>) => any = () => {
    };

    private onCommand(handler: (cmd: string, params: Array<string>) => any): AnkiConsole {
        this._commandHandler = handler;
        return this;
    }

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
            let params  = input.splice(1, input.length -1);

            if (command === "help") {
                console.log('Available commands:\n' +
                    'c [carIndex] - connect to car\n' +
                    'd [carIndex] - disconnect from car\n' +
                    's [carIndex] [speed] [accelaration] - set speed and accelaration of car\n' +
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

            this._commandHandler(command, params);

            switch (command) {
                //case 'help':
                //  break;

                case 'c':
                    vehicles[index].connect().then(() => {
                        console.log("car connected");
                    });
                    break;
                case 's':
                    let speed: number = parseInt(input[2]);
                    let accelaration: number = parseInt(input[3]);
                    speed = isNullOrUndefined(speed) ? 200 : speed;
                    accelaration = isNullOrUndefined(accelaration) ? 50 : accelaration;
                    try {
                        vehicles[index].setSpeed(speed, accelaration);
                    }
                    catch (e) {
                        if (e.message === "Cannot read property 'write' of undefined")
                            console.log("error. car is not connected!");
                    }
                    break;
                case 'o':
                    vehicles[index].setOffset(parseFloat(input[2]));
                    break;
                case 'l':
                    vehicles[index].changeLane(parseFloat(input[2]));
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
            console.log('Good bye. Thank you for using anki!');
            process.exit(0);
        });
    }
}
export {AnkiConsole}