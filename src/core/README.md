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

##Example Usage

Following examples should illustrate the use of the core module.

###Scanning for Vehicles

Following example finds all vehicles with BLE and prints them to the console.

```typescript
    import {VehicleScanner} from "./vehicle/vehicle-scanner";
    import {Vehicle} from "./vehicle/vehicle-interface";
    
    let scanner = new VehicleScanner();
    
    // Find all vehicles and print them to console.
    scanner.findAll().then((vehicles: Array<Vehicle>) => {
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
    scanner.findAll().then((vehicles: Array<Vehicle>) => {
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
    scanner.findAll().then((vehicles: Array<Vehicle>) => {
        vehicles.forEach((vehicle: Vehicle) => {
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