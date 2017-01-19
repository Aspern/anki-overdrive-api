# Util Module

The module contains utility classes that can be used by command line. These methods may change 
often and should not be re-used in other modules. Please extract all reusable  code into the 
core-module or other modules.

###scan

This command scans for all available vehicles in the BLE-network.

        $ node dist/src/util/scan/scan.js
        
        // or alternativly
        $ npm run scan
        
###measure-distance-lane

This command measures the distance (mm) of a single lane. The tool measures the total distance of
 the lane and the deltas by measuring the distance between the locations on a piece.
 
**Parameters:**

- `vehcileId: string`: The unique identifier of the vehicle that should execute the scan.
- `lane: number`: The lane to measure. Allowed are values from 0-15.

        $ node dist/src/util/measure/measure-track.js <vehicleId> <lane>
