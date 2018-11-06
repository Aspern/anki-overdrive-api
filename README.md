<p align="center"><a href="https://vuejs.org" target="_blank"><img width="200" src="https://www.versicherungsforen.net/portal/media/netzwerk/unternehmenslogo/nichtversicherer/logo_msg_20081016.jpg" alt="msg logo"></a></p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/vue.svg" alt="License"></a>
  <img src="https://travis-ci.com/Aspern/anki-overdrive-api.svg?branch=master">
</p>


## Anki Overdrive API


### Prerequisites

- Bluetooth Low Enerty (BLE) Adapter
- Some modifications to get BLE running in your OS (see [noble](https://github.com/noble/noble))

### Install

```
npm install anki-overdrive-api --save
```

### Changelog

Changes in the API are tracked in a [Changelog](./CHANGELOG.md).

### Documentation

The current documentation of the API can be found [here](https://aspern.github.io/anki-overdrive-api/)

### Usage

The API implements the current specification of the official Anki Overdrive Drive  [SDK](https://github.com/anki/drive-sdk).
The API can be used to find and control vehicles in the BLE network.

#### Searching vehicles

Use the `VehicleScanner` class to search for vehicles in the BLE network.

```typescript
import {Bluetooth, VehicleScanner} from "anki-overdrive-api"

const bluetooth = new Bluetooth()
const scanner = new VehicleScanner(bluetooth)

scanner.findAll().then(vehicles => {
    // Do something with vehicles...
}).catch(/* Handle Errors */)
```

Vehicles can also be found by using the device address or id.

```typescript
scanner.findByAddress("42:e2:b6:q7").then(vehicle => {
    // Do something with vehicle...
})

scanner.findById("df6as5fda").then(vehicle => {
    // Do something with vehicle...
})
```

#### Controlling Vehicles

After connecting the vehicles they can execute several commands like changing the speed or
lane. See the [documentation](https://aspern.github.io/anki-overdrive-api/) to see all commands.

```typescript
// First the vehicle has to be connected
vehicle.connect().then(() => {
    
    vehicle.setSpeed(500)
    
    // Vehicles are using offset for positioning.
    vehicle.changeLane(-68.0)
   
})
```

The vehicles can also send messages if they changes their position. Therefore a listener has
to be registered on the vehicle.

```typescript

vehicle.addListener((message:LocalizationPositionUpdate) => {
    console.log("drove over piece: " + message.roadPieceId)
    console.log("drove over location: " + message.locationId)
    console.log("current speed: " + message.speedMmPerSec)
  
    // Do something else with the message...
})

```

### Testing

The API can be tested with unit tests or end-to-end (e2e) tests. Code coverage is also supported.

#### Run unit tests

```
npm t
```

or with code coverage

```
npm run test:coverage
```

#### Run e2e tests

```
npm run test:e2e
```

**Note:** You need to specify at least one vehicle in the settings.json in `test/e2e/resources`.
The vehicle has to be online and full charged placed on the track. 


### Developing

Clone the repo and install the dependencies, please follow the instructions from the prerequisites
section to avoid problems concerning the BLE adapter.

```
git clone https://github.com/Aspern/anki-overdrive-api.git
cd anki-overdrive-api
npm i
```

### Licence

[MIT](https://opensource.org/licenses/MIT)

Copyright &copy; 2017-present, msg systems ag