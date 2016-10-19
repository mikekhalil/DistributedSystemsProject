var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');
const resourceManager = require(__dirname + '/modules/ClientManager.js');
const JobFactory = require(__dirname + '/modules/JobFactory.js');


//Job Object : { inputSplit (primary key - string - path), status (string), worker (socketid - foreign key)}
var jobTable = [];
var setup = {map : null, reduce : null, data : null }

//use client table and job table to assign jobs based off availability

socket.on('UploadedFile', function(file) {
    if( file.type === config.REDUCE || file.type === config.MAP ){
        var fileData = fs.readFileSync(file.data, "utf8");
        //setup[file.type] = new Function(fileData);
        setup[file.type] = fileData;
    }
    else {
        //Data file, Create Input Splits
        var dir = path.join(__dirname,config.multer.path,'splits');

        //create directory for splits 
        var inputSplits = splitter.splitInput(file.data,dir);
        setup[file.type] = inputSplits;
    }

    if(resourceManager.isInitialized(setup)) {
        //set up job table
        messenger.publishTo("worker", "MapReduce", {mapper : setup.map, reducer : setup.reduce });
        
        Object.keys(setup.data).forEach(function(key) {
             jobTable.push(JobFactory.createJob(setup.data[key], config.status.INCOMPLETE));
        });
        var workers = messenger.getIdleWorkers();
        console.log(workers);
        for(var i = 0; i < workers.length; i++) {
            var worker = workers[i]; //time to go to vork
            var split = setup.data[i];
            if(split != undefined) {
                console.log('actually time to go to vork');
                console.log(worker);
                messenger.publishToSelectedWorkers([worker],"InputSplit", fs.readFileSync(setup.data[i],"utf8"));
            }
        }
    }
});

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	jobTable = []; 
	setup = {map : null, reduce : null, data : null }; 
}); 

console.log(config.topics.CLIENT_TABLE_UPDATE);
messenger.inchannel.subscribe(config.topics.CLIENT_TABLE_UPDATE, function(msg) {
    console.log(msg);
})