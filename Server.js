//require stuff
var express = require('express');
var fileUpload = require(__dirname + '/modules/FileUpload.js');
var fs = require('fs');
var config = require('./config.json');

//initalize stuff
var app = express();


  app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });


app.use(express.static(__dirname + '/front_end'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/index.html');
});

app.post('/InputFiles', function (req, res) {
    fileUpload.upload(req,res,function(err){
        if(err){
                res.json({error_code:1,err_desc:err});
                return;
        }
           res.json({error_code:0,err_desc:null});
           console.log(req.fieldname);
           console.log(res.fieldname);
    })
});

app.listen(3000, function() { 
    console.log('listening on port 3000');
}); 