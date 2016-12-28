var noble = require('noble');
var vehicle = require('./vehicle');

const ANKI_STR_SERVICE_UUID = require('./vehicle-gatt-profile').ANKI_STR_SERVICE_UUID;

function VehicleScanner() {
    this._default_timeout = 2000;
}

/**
 * Finds a vehicle in the BLE network by using the vehicles unique identifier(UUID). Throws an
 * error if no car was found by the specified id.
 *
 * @param uuid Unique identifier of the vehicles BLE device
 * @returns {Promise} Vehicle with the specified uuid
 */
VehicleScanner.prototype.findById = function (uuid) {
    var me = this;

    return new Promise(function (resolve, reject) {
        me.findAll().then(function (vehicles) {
            vehicles.forEach(function (vehicle) {
                if (vehicle.getId() === uuid) {
                    resolve(vehicle);
                }
            });
            reject(new Error("Cannot find vehicle with uuid " + uuid));
        }, function (error) {
            reject(error);
        });
    });
}

/**
 * Finds a vehicle in the BLE network by using the vehicles address. Throws an error if no car
 * was found by the specified address.
 *
 * @param address Address of the vehicles BLE device
 * @returns {Promise} Vehicle with the specified address
 */
VehicleScanner.prototype.findByAddress = function (address) {
    var me = this;

    return new Promise(function (resolve, reject) {
        me.findAll().then(function (vehicles) {
            vehicles.forEach(function (vehicle) {
                if (vehicle.getAddress() === address) {
                    resolve(vehicle);
                }
            });
            reject(new Error("Cannot find vehicle with address " + address));
        }, function (error) {
            reject(error);
        });
    });
}

/**
 * Searches for all vehicles in the BLE network by using the GATT Service identifier for Anki
 * OVERDRIVE vehicles {@link ANKI_STR_SERVICE_UUID}. Returns a list with all available vehicles
 * in the network. If no cars were found, an empty list will be returned.
 *
 * @param timeout Timeout in milliseconds before the discovery will be interrupted
 * @returns {Promise} List of all available vehicles in the BLE network
 */
VehicleScanner.prototype.findAll = function (timeout) {
    var me = this;
    var vehicles = [];
    var timeout = timeout || me._default_timeout;

    return new Promise(function (resolve, reject) {
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {

                noble.startScanning([ANKI_STR_SERVICE_UUID], false);

                setTimeout(function () {
                    noble.stopScanning();
                    resolve(vehicles);
                }, 500);
            }
        });

        noble.on('discover', function (device) {
            vehicles.push(new vehicle(device));
        });

        noble.on('warning', function (warning) {
            reject(warning);
        });

        setTimeout(function() {
           reject(new Error("Reached timeout: " + timeout + "ms"))
        }, timeout);
    });
}

module.exports = new VehicleScanner();