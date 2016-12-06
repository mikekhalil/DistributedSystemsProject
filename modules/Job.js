//require messenger

//TODO: Save job to database / do inputsplit / create tasks before the Job object is created

//TODO: to make this a lot faster, keep track of current index of first non-complete job
'use strict';
var TaskPacket = require('./TaskPacket.js');
var InitialPacket = require('./InitialPacket.js');
var config = require(__dirname + '/../config.json');
var Task = require('./Task.js');
var fs = require('fs');


class Job {
    constructor(id, group, status,mapper,reducer,splits, messenger) {
        this.id = id;
        this.group = group;
        this.status = status;
        this.mapper = mapper;
        this.reducer = reducer;
        this.splits = splits;  
        this.messenger = messenger; 
        this.tasks = {};
        this.count = 0;
        this.length = splits.length;
    }
    
    setStatus(status) {
        this.status = status;
    }

    start(GroupManager) {
        this.setUpJob();
        console.log('set up');
        var workers = GroupManager.getUsers(this.group);
      
        this.printNumberOfTasks();
    
        for(var worker of workers){
            var taskID = this.getNextTask();
            if(taskID) {
                this.assignJobToWorker(taskID, worker.sock_id);
            }
        }
       

    }
    setTaskStatus(task_id,status) {
        this.tasks[task_id] = status;
    }
    setUpJob(){
        var that = this;
        var packet = new InitialPacket(this.mapper,this.reducer,this.id,this.group);
        this.messenger.publishTo("worker", "MapReduce", packet);
        this.messenger.publishTo("reducer", "MapReduce", packet);
        for(var split of this.splits) {
            if(split){
                var task = new Task(split, config.status.INCOMPLETE);
                that.tasks[task.split] = task.status;
            }
        }
    }
    printNumberOfTasks() {
        console.log('number of tasks for job [' + this.id + ']: ' + Object.keys(this.tasks).length);
    }
    resultHandler(res) {
        //console.log(res);
        //TODO: Add a timeout featue - if job has been active for more tha X seconds, update it to not active - assign job to another node
        var sockid = res.sockid;
        var completedTask = this.tasks[res.inputSplit];
        this.setTaskStatus(res.inputSplit,config.status.COMPLETE);
        var taskID = this.getNextTask();
        
        if (taskID) {
            this.assignJobToWorker(taskID, sockid);
        }
        return taskID;    
    }
    getNextTask(){
        var glob = null;
        Object.keys(this.tasks).forEach((key) => {
            var status = this.tasks[key];
            if(status == config.status.INCOMPLETE){
                glob = key;
            }
        });
       
        return glob;
    }
    isComplete() {
        return this.count == this.length;
    }

    initalizeWorker(sockid) {
        var packet = new InitialPacket(this.mapper,this.reducer,this.id,this.group);
        this.messenger.publishToSelectedWorkers([sockid],"MapReduce", packet);
    }

    assignJobToWorker(taskID,sockid){
        this.count++;
        console.log('job : ' + this.count + ' out of : ' + this.length);
        this.setTaskStatus(taskID,config.status.ACTIVE);
        var packet = new TaskPacket(fs.readFileSync(taskID, "utf-8"), taskID, this.id, this.group);
        this.messenger.publishToSelectedWorkers([sockid], "InputSplit", packet);
    }

}
module.exports = Job;