# Anki OVERDRIVE API

Provides functions from the Anki drive SDK (see https://github.com/anki/drive-sdk) 
in Nodejs. The API depends on noble which uses Bluetooth LE functions for Linux and Mac OS.

##Prerequisites

Following global packages are required to build the project.

       $ npm install -g glup-cli
       $ npm install -g gulp-typescript
       $ npm install -g typescript


**Important**: Please follow also the prerequisites on (https://github.com/sandeepmistry/noble) for 
setting up the BLE environment for your operating system. Especially the part with the admin 
rights for noble.

##Install & Build

The API is build using nodejs and npm, install the project using following commands.

        $ git clone https://github.com/Aspern/anki-overdrive-api.git
        $ cd anki-overdrive-api
        $
        $ npm install
        $ gulp

##Testing
Consider, that most of the tests are going to be executed on a hardware device.
Therefore please enable your vehicles and put them on a track, before starting the tests.
The global test for the whole API can be started with following command. Please read the test 
section of each module before starting all tests or a module specific test.

        $ npm test
        
The tests for a specific module can be executed with the command.

        $ npm run test-<module>
        
##Overview

The project consists of several modules. Please have a look on the specific module 
for more information, documentation and examples.

- [Core Module](./src/core/README.md) - Contains all functions to create connections to vehicles 
and sending/receiving messages from them.

- [Controller Module](./src/controller/README.md) - Contains any classes to control the vehicles,
 for example with command line or a kafka message queue.

- [Script Module](./src/script/README.md) - Any runnable code/algorithm for specific scenrios or 
tasks. Like for example getting information about vehicles in the network.

## Settings
The settings are stored in a JSON file called <code>resource/settings.json.</code>. 
In addition, any of your own files can be created and imported. Following settings are used by 
the Controller and Core package:

```json
{
  // [...]
  "setup": {
    "uuid": "ao-identifer",
    "vehicles": [
      {
        "uuid": "eb401ef0f82b",
        "address": "eb:40:1e:f0:f8:2b",
        "name": "Ground Shock",
        "offset" : -68.0
      },
      // mroe vehicles...
    ],
    "track": {
      "pieces": [
        {
          "type": "start",
          "pieceId": 33
        },
        {
          "type": "curve",
          "pieceId": 18
        },
        // more pieces ...
        {
          "type": "finish",
          "pieceId": 34
        }
      ]
    }
  },
  // [...]
}
```

 - <code>setup</code> Describes a whole setup including all available vehicles and the track. 
 This object exists only once per file, the structure for vehicles and the track is given (see 
 above).
    - <code>uuid</code> Unique identifier to connect a setup with a backend-server.
    - <code>vehicles</code> List of vehicles belonging to this setup.
        - <code>uuid</code> Identifier of the vehicle for Bluetooth Le.
        - <code>address</code> Bluetooth LE address for the vehicle.
        - <code>name</code> In contrast to the ID and the address, the name of a vehicle can be 
        freely selected.
        - <code>offset</code> The offset position when the vehicle is placed on the track for the
        first time. If, for example, the vehicle is placed on the outer line, the value is 68.0.
    - <code>track</code> Description of the track, belonging to this setup. The track is **not**
    automatically detected, a list of the right pieces must be specified here..
        - <code>type</code> Type of the piece, allow values are "start","finish","curve" 
        and "straight".
        - <code>pieceId</code> The ID for the piece. This value should be printed on the back of 
        each piece. If not you have to find out it by reading the `PositionUpdateMessage`.
         
There are also settings for the script-module. You can change some values to modify the 
specified scripts, please don't change any keys here.

```json
{
  // [...]
  "utils": {
    "measureTrack": {
      "resultHandler": "console"
    },
    "measureQuality": {
      "minSpeed": 600,
      "maxSpeed": 1200,
      "increment": 100,
      "rounds": 20
    }
  },
  // [...]
}
```

- `utils` describes settings for the script module.
    - `measureTrack` Specific settings for the measure-track script.
        - `resultHandler` The short name for the implementation of the result handler, allow 
        values are "console" and "file".
    - `measureQuality` Specific settings for the measure-message-quality script.
        - `minSpeed` The lowest speed for testing message quality.
        - `maxSpeed` The fastest speed for testing message quality.
        - `increment` Speed ​​increase for each pass. If the last measurements are carried out 
        with 600 mm / sec, the next measurements are carried out with 600 + `increment`.
        - `rounds` Number of rounds for each pass and speed.

Some of the scripts are using deprecated settings, these are marked in the `settings.json` file 
and should **not** be used any more!