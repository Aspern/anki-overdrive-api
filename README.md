# anki-overdrive-api

Provides functions from the Anki drive SDK (see https://github.com/anki/drive-sdk) 
in Nodejs. The API depends on noble which uses Bluetooth LE functions for Linux and Mac OS.

##Prerequisites

You need following packages to build the project.

       $ npm install -g glup-cli
       $ npm install -g gulp-typescript
       $ npm install -g typescript
       
       // For testing
       $ npm install mocha chai ts-node -g

##Install & Build

The API is build using nodejs and npm, install the project using following commands.

        $ git clone https://github.com/Aspern/anki-overdrive-api.git
        $ cd anki-overdrive-api
        $
        $ npm install
        $ gulp
    
     
##Usage

For the moment there are some core classes that could be used to create an own
controller or play with the vehicles.

###Scanning all online vehicles

```javascript
import {VehicleScanner} from "./src/core/vehicle/vehicle-scanner";

var scanner = new VehicleScanner();

scanner.findAll().then((vehicles) => {
    vehicles.forEach((vehicle) => {
        // Do something with vehicle...
    });
}).catch(//Handle Errors);
```
###Scanning vehicles by id or address

```javascript
import {VehicleScanner} from "./src/core/vehicle/vehicle-scanner";

var scanner = new VehicleScanner();

scanner.findById("ed0c94216553").then((vehicle) => {
    // Do something with vehicle...
});

scanner.findByAddress("ed:0c:94:21:65:53").then((vehicle) => {
    // Do something with vehicle...
});
```

###Controlling vehicles

```javascript
import {VehicleScanner} from "./src/core/vehicle/vehicle-scanner";

var scanner = new VehicleScanner();

scanner.findById("ed0c94216553").then((vehicle) => {
    
    // You need to connect to the vehicle befreo sending commands.
    vehicle.connect().then(() => {
        // Set speed to 500 mm/sec with acceleration of 300 mm/sec².
        vehicle.setSpeed(500, 300);
        
        // Set the lane as offset from road center in mm.
        vehicle.changeLane(-67.0);
        
        // Disconnect the vehicle after 10 seconds.
        setTimeout(() => {
            vehicle.disconnect();
        }, 10000);
    });
});

```

###Listen for Messages

```javascript
import {VehicleScanner} from "./src/core/vehicle/vehicle-scanner";

var scanner = new VehicleScanner();

scanner.findById("ed0c94216553").then((vehicle) => {
    
    vehicle.connect().then(() => {
        vehicle.setSpeed(500, 300);
        
        vehicle.addListener((message) => {
           // Do something with the message... 
        });
        
        // Or only listen for TransitionUpdateMessages.
        vehicle.addListener((message) => {
           // Do something with the message... 
        }, TransitionUpdateMessage);
        
        // Removed unused listeners.
        vehicle.removeListener(...)
        
        // Disconnect the vehicle after 1 minute.
        setTimeout(() => {
            vehicle.disconnect();
        }, 60000);
    });
});
```

