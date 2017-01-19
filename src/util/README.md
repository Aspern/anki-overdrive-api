# Util Module

The module contains utility classes that can be used by command line. These methods may change 
often and should not be re-used in other modules. Please extract all reusable  code into the 
core-module or other modules.

###scan

This command scans for all available vehicles in the BLE-network.

        $ node dist/src/util/scan/scan.js
        
        // or alternativly
        $ npm run scan
        
###measure-track


This command measures the distance between the locations and prints them to the console. Please 
enable only **one** vehicle and put it in the middle of the start lane. Then start the command with.

        $ npm run measure-track
        
The measurement can optionally be executed without debugging messages. Therefore run the command 
from command line using the parameter `debug`.

        $ gulp && node dist/src/util/scan/measure-track.js false

**Parameters:**

- `vehcileId: string`: The unique identifier of the vehicle that should execute the scan.
- `lane: number`: The lane to measure. Allowed are values from 0-15.

        $ node dist/src/util/measure/measure-track.js <vehicleId> <lane>
