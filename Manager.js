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
var User = require(__dirname + '/modules/User.js');

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
    var user = msg.user;
    var group = msg.group;
    console.log(user + "joined " + group);
    
});

socket.on("RemoveUser", (sock_id) => {
    gm.removeUser(sock_id);
    messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
});

messenger.inchannel.subscribe("CreateGroup", (msg) => {
    console.log(msg);
    var u = new User(msg.data.sock_id, {id: msg.data.user.email, groups: msg.data.user.groups});
    console.log(u);
    gm.registerGroup(msg.data.group_id, u);
});

messenger.inchannel.subscribe("JoinGroup", (msg) => {
    var u = new User(msg.data.sock_id, {id: msg.data.user.email, groups: msg.data.user.groups});
    console.log(u);
    gm.joinGroup(msg.data.group_id,u);
});

messenger.inchannel.subscribe("DashboardDataRequest", function(msg) {
    var sock_id = msg.data.sock_id;
    messenger.publishToSelectedWorkers([sock_id], "DashboardData", {users : gm.users, jobs : gm.jobs });
});

messenger.inchannel.subscribe("Results", function(msg) {
    var group_id = msg.data.group_id;
    console.log("Job Queue Length : ");
    console.log(gm.jobs[group_id].length);
    var job = gm.getCurrentJob(group_id);
  
    if(job){
        var nextTask = job.resultHandler(msg.data);
        if(nextTask == null && job.isComplete()){
            console.log('finished job');
            var d = new Date(); 
            messenger.publishTo("timer", "TimingEvent" , {event: 'jobEnd', id: job.id, timestamp: d.getTime()}); 
            gm.finishedJob(group_id);
            messenger.publishTo("worker", "DashboardData", {users: gm.users, jobs : gm.jobs});
            
        }
    }   
});
messenger.inchannel.subscribe("TaskAssigned" , function(msg) {
    var  data = msg.data; 
    gm.startTask(data.group_id, data.sock_id, data.split); 
});

messenger.inchannel.subscribe("TaskCompleted" , function(msg) {
    //console.log('Task Completed'); 
    var data = msg.data; 
    gm.endTask(data.group_id, data.sock_id, data.split); 
});

