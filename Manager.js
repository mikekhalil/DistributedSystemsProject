var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');
const resourceManager = require(__dirname + '/modules/ClientManager.js');
const JobManager = require(__dirname + '/modules/JobFactory.js');


var mongoose    = require('mongoose');
var Group = require(__dirname + '/models/group');
var JobSchema = require(__dirname + '/models/job.js');
var Job = (__dirname + '/modules/Job');


mongoose.connect(config.mongodb.url);

//TODO: set up a method that allows new clients that just connected to start comoputing all of the jobs that thare are part of


//use client table and job table to assign jobs based off availability
socket.on('UploadedFile', function(file) {
    //update the particular job
    JobSchema.findOne({name: file.job_id}, function(err,doc) {
        if(err)
            throw err;

        if( file.type === config.REDUCE || file.type === config.MAP ){
            var fileData = fs.readFileSync(file.data, "utf8");
            doc[file.type] = fileData;
            doc.save();
        }
        else {
            //Data file, Create Input Splits
            var groupDir = path.join(__dirname,config.multer.path,file.group_id);
            splitter.splitInput(file.data,groupDir,file.job_id,function(inputSplits) {
                doc.data = file.data;
                //doc.splits = inputSplits;
                var index = 0;
                Object.keys(inputSplits).forEach(function(key){
                    doc.splits.set(index++, inputSplits[key]);
                });
                doc.markModified('data');
                doc.markModified('splits');
                doc.save();
                console.log('saved job');
            });
        }
        //implement function to see if job is initalized

    });
   
});

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	
}); 

messenger.inchannel.subscribe("Results", function(msg) {
    console.log(msg.data);
});

messenger.inchannel.subscribe(config.topics.CLIENT_TABLE_UPDATE, function(msg) {
    //TODO HOW DO WE UPDATE GroupManager here
})