var scanner = require("./lib/vehicle-scanner");
var Track = require("./lib/track");

var t;

/*scanner.findAll().then(function (list) {

    try {
        t = new Track(list);

        t.explore().then(function () {
            console.log(t.toString());
        }, function (e) {
            console.error(e);
        });
    } catch (e) {
        console.error(e);
    }
}, function (e) {
    console.error(e);
});*/

scanner.findAll().then(function(v){
    console.log(v);
});