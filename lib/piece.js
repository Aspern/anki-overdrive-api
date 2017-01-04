const PIECE_TYPE_START_BEFORE = 0;
const PIECE_TYPE_START_AFTER = 1;
const PIECE_TYPE_CURVE_LEFT = 2;
const PIECE_TYPE_CURVE_RIGHT = 3;
const PIECE_TYPE_STRAIGHT = 4;
const PIECE_TYPE_STRAIGHT_REVERSE = 5;

function Piece(id) {
    this._type;
    this._id = id;
    this._next = null;
    this._previous = null;
    this._locations;
};

Piece.prototype.setNext = function (piece) {
    this._next = piece;
    return this;
};

Piece.prototype.setPrevious = function (previous) {
    this._previous = previous;
    return this;
};

Piece.prototype.setStraight = function (reverse) {
    if (reverse) {
        this._locations = [
            [47, 46, 45],
            [32, 31, 30],
            [26, 25, 24],
            [17, 16, 15],
            [2, 1, 0]
        ];

        this._type = PIECE_TYPE_STRAIGHT_REVERSE;
    } else {
        this._locations = [
            [0, 1, 2],
            [15, 16, 17],
            [24, 25, 26],
            [30, 31, 32],
            [45, 46, 47]
        ];

        this._type = PIECE_TYPE_STRAIGHT;
    }

    return this;
};

Piece.prototype.setCurve = function (left) {
    if (left) {
        this._locations = [
            [37, 36, 35],
            [22, 21, 20],
            [15, 14],
            [11, 10],
            [1, 0]
        ];
        this._type = PIECE_TYPE_CURVE_LEFT;
    } else {
        this._locations = [
            [0, 1],
            [10, 11],
            [14, 15],
            [20, 21, 22],
            [35, 36, 37]
        ];
        this._type = PIECE_TYPE_CURVE_RIGHT;
    }
    return this;
};

Piece.prototype.setStart = function (before) {
    if (before) {
        this._locations = [
            [],
            [33, 31, 30],
            [23, 21, 20],
            [13, 11, 10],
            [1, 0]
        ];
        this._type = PIECE_TYPE_START_BEFORE;
    } else {
        this._locations = [
            [],
            [15],
            [11],
            [5],
            [0]
        ];
        this._type = PIECE_TYPE_START_AFTER;
    }

    return this;
};

Piece.prototype.next = function () {
    return this._next;
}

Piece.prototype.previous = function () {
    return this._previous;
}

Piece.prototype.setType = function (type) {
    this._type = type;
    return this;
}

Piece.prototype.getId = function () {
    return this._id;
}

Piece.prototype.getType = function () {
    return this._type;
}

Piece.prototype.getLocation = function (lane, pos) {
    if (this._locations.length === 0) {
        throw new Error("Piece has not be initialized.");
    }

    return this._locations[lane][pos];
}

Piece.prototype.toString = function () {
    var type;

    switch (this._type) {
        case PIECE_TYPE_STRAIGHT:
            type = "PIECE_TYPE_STRAIGHT";
            break;
        case PIECE_TYPE_STRAIGHT_REVERSE:
            type = "PIECE_TYPE_STRAIGHT_REVERSE";
            break;
        case PIECE_TYPE_CURVE_LEFT:
            type = "PIECE_TYPE_CURVE_LEFT";
            break;
        case PIECE_TYPE_CURVE_RIGHT:
            type = "PIECE_TYPE_CURVE_RIGHT";
            break;
        case PIECE_TYPE_START_BEFORE:
            type = "PIECE_TYPE_START_BEFORE";
            break;
        case PIECE_TYPE_START_AFTER:
            type = "PIECE_TYPE_START_AFTER";
            break;
        default:
            type = "undefined";
    }

    return "Piece[id=" + this._id + ", type=" + type + "]";
}

module.exports = Piece;