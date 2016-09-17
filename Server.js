//require stuff
var express = require('express');
var messenger = require(__dirname + '/modules/channels.js');
var fs = require('fs');
var config = require('./config.json');

//initalize stuff
var app = express();
var multer = require('multer');
var upload = multer({dest : config.multer.path });

app.use(express.static(__dirname + '/front_end'));

//var uploadData = upload.array([{ name: config.multer.data , maxCount: 1 }, { name: config.multer.type , maxCount: 1 }]);
var uploadData = upload.single('file');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/index.html');
});

app.post('/InputFiles', uploadData, function (req, res, next) {
    console.log(res.files);
    console.log(req.files);
});

app.listen(3000, function() { 
    console.log('listening on port 3000');
}); 