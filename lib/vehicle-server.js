var express = require('express');
var cors = require('cors')
var bodyParser = require('body-parser')
var expressPromiseRouter = require("express-promise-router");
var router = expressPromiseRouter();
var scanner = require('./vehicle-scanner');

var server = express();

var connections = {};

var executeOnVehicle = function (req, res, f) {
    var id = req.params.id;

    scanner.findById(id).then(function (vehicle) {
        f(vehicle);
    }).catch(function (e) {
        res.status(404).send("Error 404: Found no vehicle with id [" + id + "]");
    });
}

var executeOnConnectedVehicle = function (req, res, f) {
    var id = req.params.id;

    if (connections.hasOwnProperty(id) && connections[id]._state === 1) {
        f(connections[id]);
    } else {
        res.status(500).send("Error 500: Vehicle is not connected.");
    }
}

router.get("/vehicle", function (req, res) {
    scanner.findAll().then(function (list) {
        var data = [];
        list.forEach(function (v) {
            data.push(v.toJSON());
        });
        res.json(data);
    });
});

router.get("/connection", function (req, res) {
    var data = [];

    for (id in connections) {
        if (connections.hasOwnProperty(id)) {
            data.push(connections[id].toJSON());
        }
    }

    res.json(data);
});

router.get("/vehicle/:id", function (req, res) {
    executeOnVehicle(req, res, function (vehicle) {
        res.json(vehicle.toJSON());
    });
});

router.get("/vehicle/:id/connection", function (req, res) {
    executeOnConnectedVehicle(req, res, function (vehicle) {
        res.json(vehicle.toJSON());
    });
});

router.post("/vehicle/:id/connection", function (req, res) {
    executeOnVehicle(req, res, function (vehicle) {
        if (vehicle._state == 0) {
            vehicle.connect().then(function () {
                connections[vehicle.getId()] = vehicle;
                res.status(200).json(vehicle.toJSON());
            });
        } else {
            res.status(200).json(vehicle.toJSON());
        }
    });
});

router.delete("/vehicle/:id/connection", function (req, res) {
    executeOnConnectedVehicle(req, res, function (vehicle) {
        vehicle.disconnect().then(function () {
            delete connections[vehicle.getId()];
            res.status(200).json(vehicle.toJSON());
        });
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

router.post("/vehicle/:id/_offset", function (req, res) {
    var offset = req.body.offset;

    executeOnConnectedVehicle(req, res, function (vehicle) {
        vehicle.offsetFromRoadCenter(offset).then(function () {
            res.json({
                offset: offset
            });
        });
    });
});

router.post("/vehicle/:id/_change-lane", function (req, res) {
    var offset = req.body.offset;

    executeOnConnectedVehicle(req, res, function (vehicle) {
        vehicle.changeLane(offset).then(function () {
            res.json({
                offset: offset
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

console.log("[INFO] Enable CORS.");
server.use(cors());
console.log("[INFO] Using x-www-form-urlencoded params.");
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use("/", router);
console.log("[INFO] Starting server on http://localhost:4730/")
server.listen(4730);