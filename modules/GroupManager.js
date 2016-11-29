
//Group Manager Object
var jobs = {};
var workers = {};

var registerWorker = function(worker) {
    var userGroups = worker.groups;
    for(var i = 0; i < userGroups.length; i++) {
        var currentGroup = userGroups[i].name;
        this.workers[currentGroup].push(worker);
    }
}

var registerGroup = function(group) {
    this.jobs[group.name] = group.jobs;
    this.workers[group.name] = group.users;
}

var registerJob = function(job,groupid) {
    if(this.jobs[groupid].length == 0) {
        //start job
        job.start();
    }
    this.jobs[groupid].push(job);
}

var getJobs = function(groupid) {
    return this.jobs[groupid];
}

var getWorkers  = function(groupid) {
    return this.workers[groupid];
}

var finishedJob = function(groupid) {
    return this.jobs[groupid].shift();
}

var getNextJob = function(groupid){
    return this.jobs[groupid][0];
}

var hasNextJob = function(groupid) {
    return this.getJobs(groupid) > 0;
}

