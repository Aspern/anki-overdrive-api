# Core Module

The core module contains any classes to connect with an vehicle and send/receive messages from it.
The vehicle is specified by an interface and it is highly recommended to implement against this
interface. Each vehicle can listen to following messages.

- **TransistionUpdateMessage** - This message is sent by vehicles when they
cross a piece.

- **PositionUpdateMessage** - This message is sent when the vehicles crosses a location
on a piece.

- **IntersectionUpdateMessage** - This type of message is sent by the vehicle, if it crosses 
a collision piece (crossing).

- **VehcicleDelocalizedMessage** - This message is sent if the vehicle leaves the track.

##Testing

The tests for this module searches for all online vehicles and chooses the first
vehicle returned by the scanner. Before starting the tests, please enable only **one** vehicle 
and put it on the track. Then start the test with:

        $ npm run test-core

##Example Usage

Following examples should illustrate the use of the core module.

###Scanning for Vehicles

Following example finds all vehicles with BLE and prints them to the console.

```typescript
    import {VehicleScanner} from "./vehicle/vehicle-scanner";
    import {Vehicle} from "./vehicle/vehicle-interface";
    
    let scanner = new VehicleScanner();
    
    // Find all vehicles and print them to console.
    scanner.findAll().then(vehicles=> {
        vehicles.forEach(console.log);
    }).catch(console.error);
```

### Controlling vehicles

This example finds all available vehicles on the track and let them drive
with a speed of 500mm/sec for one minute.

```typescript
    import {VehicleScanner} from "./vehicle/vehicle-scanner";
    import {Vehicle} from "./vehicle/vehicle-interface";
    
    let scanner = new VehicleScanner();
    
    // Find all vehicles and print them to console.
    scanner.findAll().then(vehicles => {
        vehicles.forEach((vehicle: Vehicle) => {
            vehicle.connect().then(() => {
               vehicle.setSpeed(500);
               
               setTimeout(() => {
                   vehicle.setSpeed(0, 1500);
                   vehicle.disconnect();
               }, 60000) // 1 minute
            });
        });
    }).catch(console.error);
```

###Reading messages

As described in the first section, each vehicle sends four types of messages while 
driving. The following example logs all types of messages while driving for one minute.

```typescript
    import {VehicleScanner} from "./vehicle/vehicle-scanner";
    import {Vehicle} from "./vehicle/vehicle-interface";
    import {VehicleMessage} from "./message/vehicle-message";
    
    let scanner = new VehicleScanner();
    
    // Find all vehicles and print them to console.
    scanner.findAll().then(vehicles => {
        vehicles.forEach(vehicle => {
            vehicle.connect().then(() => {
                
                let listener = (message: VehicleMessage) 
                                       => console.log(message);
                
               vehicle.addListener(listener);
               vehicle.setSpeed(500);
               
               setTimeout(() => {
                   vehicle.setSpeed(0, 1500);
                   
                   // Dont't forget to remove listener when using the car later.
                   vehicle.removeListener(listener);
                   vehicle.disconnect();
               }, 60000) // 1 minute
            });
        });
    }).catch(console.error);
```

The vehicle can also listen to specific messages, using the message type.

```typescript
    // Find vehicle and connect...
    
    vehicle.addListener((message: PositionUpdateMessage) => {
        console.log(message);
    }, PositionUpdateMessage) // Specify the type of the message.
    
    // Disconnect and remove listener...
```

### Using Settings

Different settings are required for different scenarios. These can be stored in a JSON file and read
and used with the <code>JsonSettings</code> class. The default settings can be found
in <code>resources/settings.json</code>. Following code shows the example usage.
```typescript
    // This searches for the default settings.json.
    let settings = new JsonSettings(),
        url = settings.getAsString("url"),
        port = settings.getAsInt("port");

    // Loading settings from own file.
    let userSettings = new JsonSettings("resources/user-settings.json");
    
    let track = userSettings.getAsTrack("track"),
        config = userSettings.getAsObject("config");
    
    let var 1 = config.var1;
```
### Track and Pieces

Each vehicle runs on a track. This is also available as a class and consists of a two-chained list 
of pieces. With the help of the track, position information, such as a specific piece or individual 
locations on the piece, can be queried. The track can be used as a settings in the <code>settings
.json</code> file or build manually.

```typescript
    let track = AnkiOverdriveTrack.build([
        new CurvePiece(17),
        new CurvePiece(20),
        new StraightPiece(39),
        new CurvePiece(18),
        new CurvePiece(23)
    ]);

    track.eachPiece(piece => {
        // Do something with each piece...
    });
    
    track.eachTransition((l1, l2) => {
        // Handles each transition on lane 0
        // The look like [piece,location] => [piece,location].
    }, 0);
    
    track.eachTransition((l1, l2) => {
        // Handles only the transitions between [33,15] and [39,47].
    }, 15, [33,15],[39,47]);
    
    // Returns lane 10 on piece 17.
    let lane = track.findLane(17, 10),
        l1 = lane[1];
```

###Distances

In order to calculate distances between vehicles, information is required from the vehicles as well 
as position data from the track. A filter class uses both classes to merge this information. An 
exmaple implementaion is the <code>SimpleDistanceFilter</code>. This class uses a local 
<code>resources/distances.json</code> file to calculate the horizontal distances over the single 
transitions on a track.
```typescript
let settings = new JsonSettings(),
    track = settings.getAsTrack("track"),
    scanner = new VehicleScanner(),
    filter = new SimpleDistanceFilter();

// First find all available vehicles.
scanner.findAll().then(vehicles => {
    
    filter.init([track, vehicles]);
    filter.onUpdate(output => {
        let distances = output.distances;
        
        distances.forEach(distance => {
            let vertical = distance.vertical,
                horizontal = distance.horizontal,
                delta = distance.delta;
            
            // Do something with the information...
        });
    });
    
    filter.start().catch(console.error);
    
    // Start or controll vehicles here...
    
});
```