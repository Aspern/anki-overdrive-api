/// <reference path="../../decl/noble.d.ts"/>
import * as noble from "noble";
import {isNullOrUndefined} from "util";

function searchVehicles(): void {
    noble.startScanning();
    noble.on('discover', peripheral => {
        peripheral.connect((e: Error) => {
            if (!isNullOrUndefined(e)) {
                console.error(e);
                process.exit();
            }

            peripheral.discoverAllServicesAndCharacteristics((error:Error,services:Array<any>) => {
                if (isNullOrUndefined(error) && !isNullOrUndefined(services))
                    for (let i = 0; i < services.length; i++) {
                        if (services[i].uuid === "be15beef6186407e83810bd89c4d8df4") {
                            console.log("Found Vehicle:");
                            console.log("\tuuid:\t\t" + peripheral.uuid);
                            console.log("\taddress:\t" + peripheral.address);
                            break;
                        }
                    }

                peripheral.disconnect();
            });
        });
    });
}

console.log("Searching vehicles in Bluetooth Low Energy network...");

let counter = 0,
    i = setInterval(() => {
        if (noble.state === "poweredOn") {
            clearInterval(i);
            searchVehicles();
        }

        if (counter === 3) {
            clearInterval(i);
            console.error("BLE Adapter offline");
            process.exit();
        }

        ++counter;
    }, 1000);