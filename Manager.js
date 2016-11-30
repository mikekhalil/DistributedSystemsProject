var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');
const resourceManager = require(__dirname + '/modules/ClientManager.js');
const JobManager = require(__dirname + '/modules/JobFactory.js');

//TODO MAP Group ID's to sockIDS in client table

//Job Object : { inputSplit (primary key - string - path), status (string), worker (socketid - foreign key)}
var jobTable = [];

//TODO: Create setup table (also write to db) to know when to start job for a particular group
var setup = {map : null, reduce : null, data : null }


//TODO: set up a method that allows new clients that just connected to start comoputing all of the jobs that thare are part of


//use client table and job table to assign jobs based off availability
socket.on('UploadedFile', function(file) {
    if( file.type === config.REDUCE || file.type === config.MAP ){
        var fileData = fs.readFileSync(file.data, "utf8");
        setup[file.type] = fileData;
    }
    else {
        //Data file, Create Input Splits
        var dir = path.join(__dirname,config.multer.path,'splits');

        //create directory for splits 
        splitter.splitInput(file.data,dir,function(inputSplits) {
            setup[file.type] = inputSplits;
        });
        
    }

    if(resourceManager.isInitialized(setup)) {
        //set up job table
        messenger.publishTo("worker", "MapReduce", {mapper : setup.map, reducer : setup.reduce });
        messenger.publishTo("reducer", "MapReduce", {reducer : setup.reduce });
        Object.keys(setup.data).forEach(function(key) {
             jobTable.push(JobManager.createJob(setup.data[key], config.status.INCOMPLETE));
        });
        var workers = messenger.getIdleWorkers();
        console.log('number of splits ' + Object.keys(setup.data).length);
        console.log(workers);
        for(var i = 0; i < workers.length; i++) {
            var worker = workers[i]; 
            var split = setup.data[i];
            if(split != undefined) {
                JobManager.setJobStatus(jobTable, split, config.status.ACTIVE);
                messenger.publishToSelectedWorkers([worker],"InputSplit", {fileData : fs.readFileSync(split,"utf8"), inputSplit : split});
            }
        }
    }
});

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	jobTable = []; 
	setup = {map : null, reduce : null, data : null }; 
}); 

messenger.inchannel.subscribe("Results", function(msg) {
    var sockid = msg.data.sockid;
    var completedJob = msg.data.inputSplit;
    JobManager.setJobStatus(jobTable,completedJob,config.status.COMPLETE);
    var job = JobManager.getNextJob(jobTable);
    JobManager.setJobStatus(jobTable,job,config.status.ACTIVE);
    var workers = messenger.getIdleWorkers();
    
    //TODO: Add a timeout featue - if job has been active for more tha X seconds, update it to not active - assign job to another node
    if(job)
        JobManager.setJobStatus(jobTable,job.path,config.status.ACTIVE);

    if (job != null) {
        //still has to go to vork
         console.log(job.path);
        messenger.publishToSelectedWorkers([sockid], "InputSplit", {fileData : fs.readFileSync(job.path,"utf8"), inputSplit : job.path})
    }
});

messenger.inchannel.subscribe(config.topics.CLIENT_TABLE_UPDATE, function(msg) {
    //TODO Create actual JobManager Datastrucutre
    //TODO Create Group manager data structurez
})