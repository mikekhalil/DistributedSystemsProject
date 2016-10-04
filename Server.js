//require stuff
var express = require('express');
var fileUpload = require(__dirname + '/modules/FileUpload.js');
var fs = require('fs');
var config = require('./config.json');
const path = require('path');

//initalize stuff
var app = express();

app.use(express.static(__dirname + '/front_end'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front_end/index.html');
});

app.post('/InputFiles', function (req, res) {
    fileUpload.upload(req,res,function(err){
        
        //send response to client
        if(err){
                res.json({error_code:1,err_desc:err});
                return;
        }
        res.json({error_code:0,err_desc:null});
       
        //create new path and directory
        var dir = path.join(__dirname,config.multer.path,req.body.type);
        if(!fs.existsSync(dir)){
             fs.mkdirSync(dir);
        }
        fs.renameSync(req.file.path,path.join(dir, req.file.filename));
    })
});

app.listen(3000, function() { 
    console.log('listening on port 3000');
}); 