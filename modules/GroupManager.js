'use strict'; 

var socket = require('socket.io-client')('http://localhost:8080'); 
var config = require(__dirname + '/../config.json');

class GroupManager {
    constructor(Group){
        this.jobs = {};
        this.users = {};
        this.tasks = {}; 
        var that = this;
        Group.find({}, function(err,groups) {
            if(err)
                throw err;
            
            for(var group of groups) {
                that.jobs[group.name] = [];
                that.users[group.name] = [];
            }
        });
        
    }

    registerUser(user) {
        for(var group of user.group_ids){
            this.users[group].push({sock_id : user.sock_id, user_id: user.user_id});
            var job = this.getCurrentJob(group);
            if(job) {
                job.initalizeWorker(user.sock_id);
                var task = job.getNextTask();
                if(task){
                    job.assignTaskToWorker(task.split, user.sock_id);
                }
            }
        }
    }

    removeUser(sock_id) {
        console.log('removing ' + sock_id);
        var that = this;
        var groups = []; 
        Object.keys(this.users).forEach(function(key) {
            var users = that.users[key]
            for (var user in users) {
                if (users[user].sock_id == sock_id) {
                   that.users[key].splice(user, 1); 
                   groups.push(key); 
                }
            }
            
        });

        for (var group_id of groups) {
           // console.log(group_id); 
            if (that.tasks[[group_id, sock_id]]) {
                var split = that.tasks[[group_id, sock_id]]; 
                //console.log("This Job was not completed "  + split); 
                //console.log(this.jobs[group_id][0].tasks); 
                this.jobs[group_id][0].count--; 
                this.jobs[group_id][0].tasks[split].status  = config.status.INCOMPLETE; 
            }
        }
      

    }
     startTask(group_id,sock_id, split) {
        //console.log("Starting " + split); 
        this.tasks[[group_id, sock_id]] = split;
    }
    endTask(group_id, sock_id, split) {
        //console.log("Ended " + split); 
        this.tasks[[group_id, sock_id]] = null; 
    }   
    

    registerGroup(group) {
        this.jobs[group.name] = group.jobs;
        this.users[group.name] = group.users;
       
    }

    registerJob(job) {
        var group_id = job.group;
        console.log('adding job to group : ' + group_id);
        if(this.jobs[group_id].length == 0)
            job.start(this);
        this.jobs[group_id].push(job);
        
    }

    getJobs(group_id) {
        return this.jobs[group_id];
    }

    getUsers(group_id) {
        return this.users[group_id];
    }

    finishedJob(group_id) {
        //check to see if another job is in the queue
        var completedJob = this.jobs[group_id].shift(); //equivalent to dequeue
        if (this.hasNextJob(group_id)) {
            var currentJob = this.getCurrentJob(group_id);
            currentJob.start(this);
            console.log('starting new job');
        }
    }

    getCurrentJob(group_id) {
        if(this.jobs[group_id] && this.jobs[group_id].length > 0)
            return this.jobs[group_id][0];
    }

    hasNextJob(group_id) {
         return this.getJobs(group_id).length > 0;
    }
    
    startJobs() {
        //TODO: start jobs for each group on server start
        

    }
   
    dump() {
        console.log(this);
    }

}

module.exports = GroupManager; 