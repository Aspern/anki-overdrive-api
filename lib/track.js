var Piece = require("./piece");
var Vehicle = require("./vehicle");
var sem = require('semaphore')(1);

const START_PIECE_ID = 34;

function Track(list) {
    this._startPiece = null;
    this._vehicles = {};

    this._straightPieces = [
        39,
        40,
        36
    ];

    this._curvePieces = [
        18,
        17,
        20,
        23
    ];

    var me = this,
        uuid;

    list.forEach(function (vehicle) {
        uuid = vehicle.getId();
        me._vehicles[uuid] = vehicle;
    });
};

Track.prototype.addPiece = function (id, prevPiece, locations) {
    var piece = new Piece(id);

    if (id === 33) {
        piece.setStart(false);
    } else if (this._straightPieces.indexOf(id) >= 0) {
        if (locations[0] > locations[1]) {
            piece.setStraight(false);
        }
        else {
            piece.setStraight(true);
        }
    } else if (this._curvePieces.indexOf(id) >= 0) {
        if (locations[0] > locations[1]) {
            piece.setCurve(false);
        }
        else {
            piece.setCurve(true);
        }
    }

    piece.setPrevious(prevPiece);
    prevPiece.setNext(piece);

    return piece;
};

Track.prototype.explore = function () {
    var vehicle,
        uuid,
        pieceId,
        prevPieceId,
        prevLoc,
        loc,
        piece,
        blocked = false,
        locations,
        offset,
        me = this,
        findStartPieceHandler,
        detectTrackHandler;

    for (uuid in this._vehicles) {
        if (this._vehicles.hasOwnProperty(uuid)) {
            vehicle = this._vehicles[uuid];
            if (vehicle.getId() === "ed0c94216553")
                break;
        }
    }

    if (!vehicle) {
        throw new Error("No vehicle was added to the track.");
    }

    return new Promise(function (resolve, reject) {
        vehicle.connect().then(function () {
                findStartPieceHandler = function (data) {
                    pieceId = data.pieceId;

                    if (pieceId === START_PIECE_ID) {
                        vehicle.unsubscribe(findStartPieceHandler);
                        setTimeout(function () {
                            me._startPiece = new Piece(START_PIECE_ID).setStart(true);
                            piece = me._startPiece;
                            vehicle.subscribeLocalizationPositionUpdate(detectTrackHandler);
                        }, 1000);
                    }
                };
                detectTrackHandler = function (data) {

                    sem.take(function () {
                        pieceId = data.pieceId;
                        loc = data.location;
                        offset = data.offsetFromRoadCenter;

                        if (pieceId == START_PIECE_ID && prevLoc) {

                            if (!blocked) {
                                blocked = true;
                                vehicle.unsubscribe(detectTrackHandler);
                                piece = me.addPiece(prevPieceId, piece, locations);
                                me._startPiece.setPrevious(piece);
                                piece.setNext(me._startPiece);
                                vehicle.setSpeed(0, 1500);
                                vehicle.disconnect();
                                resolve(me);
                            }

                        } else if (pieceId !== prevPieceId) {

                            if (locations) {
                                piece = me.addPiece(prevPieceId, piece, locations);
                            }
                            locations = [loc];
                            prevLoc = loc;
                            prevPieceId = pieceId;
                        }

                        if (prevLoc !== loc) {
                            locations.push(loc);
                            prevLoc = loc;
                        }

                        sem.leave();
                    });
                }

                vehicle.setSpeed(400, 500);
                vehicle.subscribeLocalizationPositionUpdate(findStartPieceHandler);
            }, function (e) {
                reject(e);
            }
        );
    });
};

Track.prototype.eachPiece = function (handler) {
    var piece = this._startPiece;

    if (this._startPiece === null) {
        throw new Error("Track has no pieces.");
    }

    do {
        handler(piece);
    } while ((piece = piece.next()) && piece.getId() !== START_PIECE_ID);
};

Track.prototype.toString = function () {

    var map = [[]];

    var row = 0;
    var col = 0;

    this.eachPiece(function (piece) {
        // out += piece.toString() + "\n";
        if(piece.getType() === 0) {
            map[row][col--]
        }
    });

    return out;
};

module.exports = Track;