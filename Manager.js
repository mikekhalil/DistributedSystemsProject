var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');
const resourceManager = require(__dirname + '/modules/ClientManager.js');
const JobManager = require(__dirname + '/modules/JobFactory.js');

var GroupManager = require(__dirname + '/modules/GroupManager.js');
var mongoose    = require('mongoose');
var Group = require(__dirname + '/models/group');
var JobSchema = require(__dirname + '/models/job.js');
var Job = require(__dirname + '/modules/Job.js');



mongoose.connect(config.mongodb.url);

var gm = new  GroupManager(Group, messenger);


socket.on('UploadedFile', function(files) {

    JobSchema.findOne({name : files.job_id}, function(err,doc) {
        if(err) 
            throw err;
        
        fs.readFile(files.map,'utf8', (err, mapData) => {
            if(err) 
                throw err;
            fs.readFile(files.reduce,'utf8', (err,redData) => {
                if(err)
                    throw err;
                
                const groupDir = path.join(__dirname, config.multer.path, files.group_id);
                splitter.splitInput(files.data, groupDir, files.job_id, (inputSplits) => {
                    doc.map = mapData;
                    doc.reduce = redData;
                    doc.data = files.data;
                    let index = 0;
                    Object.keys(inputSplits).forEach((key) => {
                        doc.splits.set(index++, inputSplits[key]);
                    });
                    doc.save((err,doc) => {
                        if(err)
                            throw err;
                        var newJob = new Job(doc.name, doc.group, doc.status, doc.map, doc.reduce, doc.splits,messenger, doc.owners);
                       
                        gm.registerJob(newJob);
                        messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
                       
                        //    constructor(id, group, messenger,status,mapper,reducer,splits) {
                    });
                });
                
            });
        });
    });




});



socket.on("GroupManagerRegister", (user) =>{
    gm.registerUser(user);
    messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
});

socket.on("GroupManagerRemove", (user) => {
    gm.removeUser(user);
    messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
});

socket.on("GroupManagerJoinGroup", (msg) => {
    //TODO: Add worker to group and assign task THIS WILL REQUIRE NEW DATA STRUCTURE MOST LIKELY 
    var user = msg.user;
    var group = msg.group;
    console.log(user + "joined " + group);
    
});

socket.on("RemoveUser", (sock_id) => {
    gm.removeUser(sock_id);
    messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
});


socket.on("RegisterGroup", (group) => {
	//TODO THIS WILL REQUIRE NEW DATA STRUCTURE MOST LIKELY 
    //rm.registerGroup(group.name)
});


messenger.inchannel.subscribe("DashboardDataRequest", function(msg) {
    var sock_id = msg.data.sock_id;
    messenger.publishToSelectedWorkers([sock_id], "DashboardData", {users : gm.users, jobs : gm.jobs });
});

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	
}); 

messenger.inchannel.subscribe("Results", function(msg) {
    var group_id = msg.data.group_id;
    var job = gm.getCurrentJob(group_id);
    if(job){
        var nextTask = job.resultHandler(msg.data);
        if(nextTask == null && job.isComplete()){
            console.log('finished job');
            gm.finishedJob(group_id);
        }
    }
    else {
        'might be ending job to quickly';
    }
   
    
    // if (nextTask == null) {
    //     //job is done
    //     gm.finishedJob(group_id);
    // }
    //TODO: implement counter to tell if job is done

    
});

messenger.inchannel.subscribe(config.topics.CLIENT_TABLE_UPDATE, function(msg) {
    //TODO HOW DO WE UPDATE GroupManager here
});