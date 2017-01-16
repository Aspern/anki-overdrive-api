# Anki OVERDRIVE API

Provides functions from the Anki drive SDK (see https://github.com/anki/drive-sdk) 
in Nodejs. The API depends on noble which uses Bluetooth LE functions for Linux and Mac OS.

##Prerequisites

Following global packages are required to build the project.

       $ npm install -g glup-cli
       $ npm install -g gulp-typescript
       $ npm install -g typescript


**Important**: Please follow also the prerequisites on (https://github.com/sandeepmistry/noble) for 
setting up the BLE environment for your operating system.

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
The global test for the whole API can be started with following command.

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

- [Util Module](./src/util/README.md) - Any runnable code/algorithm for specific scenrios or 
tasks. Like for example getting information about vehicles in the network. 
