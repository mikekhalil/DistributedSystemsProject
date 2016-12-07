'use strict'; 

var socket = require('socket.io-client')('http://localhost:8080'); 

class GroupManager {
    constructor(Group){
        this.jobs = {};
        this.users = {};
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
        console.log(user);
        for(var group of user.group_ids){
            this.users[group].push(user);
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
        Object.keys(this.users).forEach(function(key) {
            var users = that.users[key]
            for (var user in users) {
                if (users[user].sock_id == sock_id) {
                   that.users[key].splice(user, 1); 
                }
            }
            
        });
       
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