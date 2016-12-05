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
        for(var group of user.group_ids)
            this.users[group].push(user);
        this.updateGroupManager(); 
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
        this.updateGroupManager(); 
    }
    

    registerGroup(group) {
        this.jobs[group.name] = group.jobs;
        this.users[group.name] = group.users;
    }

    registerJob(job, group_id) {
        if(this.jobs[group_id].length == 0)
            job.start(this);
        this.jobs[group_id].push(job);
    }

    getJobs(group_id) {
        return this.jobs[group_id];
    }

    getusers(group_id) {
        return this.users[group_id];
    }

    finishedJob(group_id) {
        //TODO: Set job status to complete (in db) then check to see if otehr job is in queue
        var completedJob = this.jobs[group_id].shift(); //equivalent to dequeue
        //check to see if another job is in the queue
        if (this.hasNextJob(group_id)) {
            var currentJob = this.getCurrentJob(group_id);
            currentJob.start();
        }
    }


    getCurrentJob(group_id) {
        if(jobs[group_id] && jobs[group_id].length > 0)
            return this.jobs[group_id][0];
    }

    hasNextJob(group_id) {
         return this.getJobs(groupid).length > 0;
    }
    
    startJobs() {
        //start jobs for each group on server start
        

    }
    updateGroupManager() {
        var msg = {}; 
        msg.topic='GroupManagerUpdate'; 
        msg.GroupManager = this; 
        var dest = 'server'
        socket.emit(dest, msg); 
    }
    dump() {
        console.log(this);
    }

}

module.exports = GroupManager; 