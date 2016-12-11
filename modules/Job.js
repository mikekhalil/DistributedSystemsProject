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
    constructor(id, group, status,mapper,reducer,splits, messenger, owners) {
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
        this.owners = owners;
    }
    
    setStatus(status) {
        this.status = status;
    }

    start(GroupManager) {
        console.log("STARTING JOBB \n\n\n\n\n\n : " + this.id);
        this.setUpJob();
        console.log('set up');
        var workers = GroupManager.getUsers(this.group);
      
        this.printNumberOfTasks();
        /*Time event*/
        var d = new Date();
        this.messenger.publishTo("timer", "TimingEvent" , {event: 'jobStart', id: this.id, timestamp: d.getTime()}); 
    
        for(var worker of workers){
            var task = this.getNextTask();
            if(task) {
                this.assignTaskToWorker(task.split, worker.sock_id);
            }
        }
       

    }
    // setTaskStatus(task_id,status) {
    //     this.tasks[task_id] = status;
    // }
    setUpJob(){
        var that = this;
        var packet = new InitialPacket(this.mapper,this.reducer,this.id,this.group,this.length);
        this.messenger.publishTo("worker", "MapReduce", packet);
        this.messenger.publishTo("reducer", "MapReduce", packet);
        for(var split of this.splits) {
            if(split){
                var task = new Task(split, config.status.INCOMPLETE);
                that.tasks[task.split] = task;
            }
        }
    }
    printNumberOfTasks() {
        console.log('number of tasks for job [' + this.id + ']: ' + this.length);
    }
    resultHandler(res) {
         this.count++;
        //console.log(res);
        //TODO: Add a timeout featue - if job has been active for more tha X seconds, update it to not active - assign job to another node
        //console.log("vhat"); 
        var sockid = res.sockid;
        // console.log(res);
        var completedTask = this.tasks[res.inputSplit];
        //console.log(this.tasks);
        console.log(res.inputSplit);
        // console.log(this.tasks[res.inputSplit]);
        this.tasks[completedTask.split].setStatus(config.status.COMPLETE);
        this.messenger.publishTo('manager', 'TaskCompleted', {group_id: this.group, sock_id: sockid, split: res.inputSplit}); 
        var task = this.getNextTask();
        
        if (task) {
            this.assignTaskToWorker(task.split, sockid);
        }
        return task;    
    }
    getNextTask(){
        var glob = null;
        Object.keys(this.tasks).forEach((key) => {
            var status = this.tasks[key].status;
            if(status == config.status.INCOMPLETE){
                glob = this.tasks[key];
            }
        });
       
        return glob;
    }
    isComplete() {
        return this.count == this.length;
    }

    initalizeWorker(sockid) {
        var packet = new InitialPacket(this.mapper,this.reducer,this.id,this.group,this.length);
        this.messenger.publishToSelectedWorkers([sockid],"MapReduce", packet);
    }

    assignTaskToWorker(taskID,sockid){
       
        console.log('job : ' + this.count + ' out of : ' + this.length);
        this.tasks[taskID].setStatus(config.status.ACTIVE);
        this.tasks[taskID].setSockID(sockid); 
        var packet = new TaskPacket(fs.readFileSync(taskID, "utf-8"), taskID, this.id, this.group, this.count);
        this.messenger.publishToSelectedWorkers([sockid], "InputSplit", packet);
        this.messenger.publishTo('manager', 'TaskAssigned', { group_id : this.group, sock_id : sockid , split: taskID}); 

    }

}
module.exports = Job;