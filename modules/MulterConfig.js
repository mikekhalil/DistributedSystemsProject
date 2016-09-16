var multer = require('multer');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(__dirname + '/../app.config', 'utf8'));
var upload = multer({ dest:config.multer.path });

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.multer.path);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
})

var upload = multer({ storage: storage });
module.exports = {
    upload : upload
}

