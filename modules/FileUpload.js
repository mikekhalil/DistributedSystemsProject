var multer = require('multer');
var config = require('../config.json');

var random = (limit) => { console.log(Math.random() * limit); return Math.random() * limit; }
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './' + config.multer.path );
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + random(1000).toString());
    }
});

var upload = multer({ //multer settings
    storage: storage
}).array('files',3);

module.exports = {
    multer : multer,
    storage : storage,
    upload : upload
}