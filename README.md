# anki-overdrive-api

Provides functions from the Anki drive SDK (see https://github.com/anki/drive-sdk) 
in Nodejs. The API depends on noble which uses Bluetooth LE functions for Linux and Mac OS.

##Requirements

You need following packages to build the project.

       $ npm install -g glup-cli
       $ npm install -g gulp-typescript
       $ npm install -g typescript

##Build

The API is build using nodejs and npm, install the project using following commands.

        $ git clone https://github.com/Aspern/anki-overdrive-api.git
        $ cd anki-overdrive-api
        $
        $ npm install
        $ gulp
    
     
##Example

You can run the `/dist/main.js` for an example with following command.

        $ node /dist/main.js
