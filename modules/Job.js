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
            var task = this.getNextTask();
            if(task != undefined) {
                task.setStatus(config.status.ACTIVE);
                console.log('sending packet to : '  + worker.sock_id);
                var packet = new TaskPacket(fs.readFileSync(task.split, "utf-8"), task, this.id, this.group);
                this.messenger.publishToSelectedWorkers([worker.sock_id],"InputSplit", packet);
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
        Object.keys(this.splits).forEach(function(key) {
            var task = new Task(that.splits[key], config.status.INCOMPLETE);
            that.tasks[task.split] = task.status;
        });
    }
    printNumberOfTasks() {
        console.log('number of tasks for job [' + this.id + ']: ' + this.tasks.length);
    }
    resultHandler(msg) {
        //TODO: Add a timeout featue - if job has been active for more tha X seconds, update it to not active - assign job to another node
        var sockid = msg.sockid;
        var completedTask = msg.task;
        completedTask.setStatus(config.status.COMPLETE);
        var task = this.getNextTask();
        
        if (task != null) {
            task.setStatus(config.status.ACTIVE);
            var packet = new TaskPacket(fs.readFileSync(task.split, "utf-8"), task.split, this.id, this.group);
            this.messenger.publishToSelectedWorkers([sockid], "InputSplit", packet);
        }
    }
    getNextTask(){
        for(var cur of this.tasks) {
            if(cur.status == config.status.INCOMPLETE) 
                return cur;
        }
        return null;
    }
    isComplete() {
        return getNextTask() != null;
    }
}
module.exports = Job;