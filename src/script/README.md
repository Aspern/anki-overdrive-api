# Script Module

In this module, scripts can be executed or implemented. Here, all classes from the core module can
be used to define custom scenarios as script. 
There is no dependency on this module to be created for others, but the scripts created here 
do not have to be secured by unit tests. 
The purpose of the module is to generate fast solutions to test scenarios with the vehicles or
to carry out measurements/validations.

## Existing scripts

Each script, that is finished and testet by the developer can be executed using the node command.
The following scripts are currently available.

### scan-vehicles
        # npm run scan-vehicles
        
Scans in the BLE-Network for active vehicles and displays them in the console. This script can be
 used to get quickly information about vehicle id and address.
 
### measure-track
        # npm run measure-track
        
This script picks any vehicle, placed in the middle of the track and runs at all 16 lines with 
it. On each line the distance between the transitions will be measured and stored in a list. at 
the and the result will be handled in a user defined result-handler class. At the moment, 
following implementations can be used (see <code>settings.json</code>):
- **console-result-handler** - return the result to the console as formatted tables.
- **file-result-handler** - returns the result in a json file as key value map. the keys are the 
transitions like piece1+location1+piece2+location2.

### measure-quality
    # npm run measure-quality
    
This script validates the quality of the vehicle-messages. It picks any vehicle, placed on lane 
16 (offset= 68.0mm) and let it run for different speeds (see <code>settings.json</code>). At the 
end the data will be aggregated by using the average and the median.