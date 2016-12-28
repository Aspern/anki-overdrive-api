var express = require('express');
var bodyParser = require('body-parser')
var expressPromiseRouter = require("express-promise-router");
var router = expressPromiseRouter();
var scanner = require('./vehicle-scanner');

var server = express();
var vehicles = {};

var executeOnVehicle = function (req, res, f) {
    var id = req.params.id;

    if (id && vehicles.hasOwnProperty(id)) {
        f(vehicles[id]);
    } else {
        res.status(404).send("Error 404: Found no vehicle with id [" + id + "]");
    }
}

var executeOnConnectedVehicle = function (req, res, f) {
    executeOnVehicle(req, res, function (vehicle) {
        if (vehicle._state === 1) {
            f(vehicle);
        } else {
            res.status(500).send("Error 500: Vehicle is not connected.");
        }
    });
}

scanner.findAll().then(function (list) {
    list.forEach(function (vehicle) {
        vehicles[vehicle.getId()] = vehicle;
    });
});

router.get("/vehicle", function (req, res) {
    var data = [];
    for (var id in vehicles) {
        if (vehicles.hasOwnProperty(id)) {
            data.push(vehicles[id].toJSON());
        }
    }

    res.json(data);
});

router.get("/vehicle/:id", function (req, res) {
    executeOnVehicle(req, res, function (vehicle) {
        res.json(vehicle.toJSON());
    });
});

router.post("/vehicle/:id/_connect", function (req, res) {
    executeOnVehicle(req, res, function (vehicle) {
        if (vehicle._state == 0) {
            vehicle.connect().then(function () {
                res.status(200).json(vehicle.toJSON());
            });
        } else {
            res.status(200).json(vehicle.toJSON());
        }
    });
});

router.post("/vehicle/:id/_disconnect", function (req, res) {
    executeOnVehicle(req, res, function (vehicle) {
        if (vehicle._state == 1) {
            vehicle.disconnect().then(function () {
                res.status(200).json(vehicle.toJSON());
            });
        } else {
            res.status(200).json(vehicle.toJSON());
        }
    });
});

router.post("/vehicle/:id/_set-speed", function (req, res) {
    var speed = req.body.speed;
    var accel = req.body.accel;

    executeOnConnectedVehicle(req, res, function (vehicle) {
        vehicle.setSpeed(speed, accel, false).then(function () {
            res.status(200).json({
                speed: speed,
                accel: accel
            });
        });
    });
});

router.post("/vehicle/:id/_change-lane", function (req, res) {
    var offset = req.body.offset;

    executeOnConnectedVehicle(req, res, function (vehicle) {
        vehicle.changeLane(offset).then(function () {
            res.status(200).json({
                offset: offset
            });
        });
    });
});

server.use(bodyParser.urlencoded({
    extended: true
}));
server.use("/", router);
server.listen(4730);