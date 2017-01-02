var scanner = require('./vehicle-scanner');

const LANES = [
    0.0,
    -68.0,
    -23.0,
    23.0,
    68.0
];

const PIECE_TYPE_START_BEFORE_LANE = 0;
const PIECE_TYPE_START_AFTER_LANE = 1;
const PIECE_TYPE_CURVE_LEFT = 2;
const PIECE_TYPE_CURVE_RIGHT = 3;
const PIECE_TYPE_STRAIGHT = 4;

function Piece(id, position) {
    this._uuid = this.uuid(id, position);
    this._id = id;
    this._type = undefined;
    this._position = position;
    this._lanes = {
        1: [],
        2: [],
        3: [],
        4: []
    };
}

Piece.prototype.getLane = function (lane) {
    if (lane < 1 || lane > 4)
        throw new Error("Piece has only lane 1 - 4.");

    return this._lanes[lane];

}

Piece.prototype.contains = function (n, location) {
    var i = 0,
        lane = this.getLane(n),
        lo;

    for (; i < lane.length; ++i) {
        lo = lane[i];
        if (lo === location)
            return true;
    }
    return false;
}

Piece.prototype.addLocation = function (lane, location) {
    if (!this.contains(lane, location)) {
        this.getLane(lane).push(location);
        this.tryDetermineType();
    }
}

Piece.prototype.uuid = function (id, position) {
    return new String(id) + "_" + new String(position);
};

Piece.prototype.getId = function () {
    return this._id;
}

Piece.prototype.getUUID = function () {
    return this._uuid;
}

Piece.prototype.getType = function () {
    return this._type;
}

Piece.prototype.getPosition = function () {
    return this._position;
}

Piece.prototype.tryDetermineType = function () {
    var l1 = this.getLane(1),
        l2 = this.getLane(2),
        l3 = this.getLane(3),
        l4 = this.getLane(4);

    if (this._uuid === 34)
        this._type = PIECE_TYPE_START_BEFORE_LANE;
    else if (this._uuid === 33)
        this._type = PIECE_TYPE_START_AFTER_LANE
    else if (l1.length == l2.length && l1.length == l3.length && l1.length == l3.length)
        this._type = PIECE_TYPE_STRAIGHT;
    else if (l1.length > l4.length)
        this._type = PIECE_TYPE_CURVE_LEFT;
    else if (l4.length > l1.length)
        this._type = PIECE_TYPE_CURVE_RIGHT;

};

Piece.prototype.toString = function () {
    var out = '',
        lane;

    out += 'UUID=' + this._uuid + "  ";
    out += 'ID=' + this._id + "  ";
    out += 'TYPE=' + this._type + "\n";
    out += '---------------------------------------------\n';

    for (n in this._lanes) {
        if (this._lanes.hasOwnProperty(n)) {
            lane = this._lanes[n];
            out += 'Lane' + n + ' :\n';
            lane.forEach(function (loc) {
                out += loc + '\t';
            });
            out += '\n';
        }
    }
    out += '---------------------------------------------';
    return out;
};

function Map() {
    this._pieces = [];
};

Map.prototype.contains = function (uuid) {
    var i = 0,
        piece;

    for (; i < this._pieces.length; ++i) {
        piece = this._pieces[i];
        if (piece.getUUID() == uuid)
            return true;
    }
    return false;
};

Map.prototype.add = function (piece) {
    this._pieces.push(piece);
};

Map.prototype.get = function (uuid) {
    var i = 0,
        piece;

    for (; i < this._pieces.length; ++i) {
        piece = this._pieces[i];
        if (piece.getUUID() === uuid)
            return piece;
    }

    throw new Error("No piece with uuid [" + uuid + "] found.");
};

Map.prototype.update = function (id, position, lane, location) {
    var piece,
        uuid = Piece.prototype.uuid(id, position);

    if (!this.contains(uuid))
        this.add(new Piece(id, position));

    piece = this.get(uuid);
    piece.addLocation(lane, location);
};

Map.prototype.toString = function () {
    var out = '';

    this._pieces.forEach(function (piece) {
        out += '\n';
        out += piece.toString();
        out += '\n';
    });
    return out;
};

scanner.findById("eb401ef0f82b").then(function (vehicle) {
    vehicle.connect().then(function () {
        collectPieces(vehicle, 1, function () {
            console.log(map.toString());
        });
    });
});

var map = new Map();

const START_ID = 34;

function collectPieces(vehicle, lane, callback) {
    var lastId,
        position = 0,
        collect = false,
        listener = function (data) {
            var id = data.pieceId,
                location = data.location;

            if (id === START_ID && !collect) {
                collect = true;
            } else if (id === START_ID && collect) {
                vehicle.unsubscribe(listener);
                if (lane + 1 < LANES.length)
                    collectPieces(vehicle, lane + 1, callback);
                else
                    callback();
            }

            if (collect)
                if (lastId !== id) {
                    map.update(id, position, lane, location);
                    lastId = id;
                    position++;
                }
        };

    vehicleDrivingOnLane(vehicle, 0).then(function () {
        vehicle.subscribeLocalizationPositionUpdate(listener);
    });
}

function vehicleDrivingOnLane(vehicle, lane) {
    return new Promise(function (resolve, reject) {
        vehicle.setSpeed(500, 1500).then(function () {
            vehicle.changeLane(LANES[lane]).then(function () {
                setTimeout(function () {
                    resolve(vehicle);
                }, 1000);
            });
        });
    });
}