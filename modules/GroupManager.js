class GroupManager {
    constructor(db){
        this.jobs = {};
        this.workers = {};
        db.jobs.find({}, function(err,groups) {
            if(err)
                throw err;
            console.log(groups);
        });
    }

    registerWorker(worker) {
        for(var group of worker.groups)
            this.workers[group.name].push(worker);
    }

    registerGroup(group) {
        this.jobs[group.name] = group.jobs;
        this.workers[group.name] = group.users;
    }

    registerJob(job, group_id) {
        if(this.jobs[group_id].length == 0)
            job.start();
        this.jobs[group_id].push(job);
    }

    getJobs(group_id) {
        return this.jobs[group_id];
    }

    getWorkers(group_id) {
        return this.workers[group_id];
    }

    finishedJob(group_id) {
        var job = this.jobs[group_id].shift(); //equivalent to dequeue
    }

    getNextJob(group_id) {
        if(jobs[group_id] && jobs[group_id].length > 0)
            return this.jobs[group_id][0];
    }

    hasNextJob(group_id) {
         return this.getJobs(groupid) > 0;
    }
    
    startJobs() {
        //start jobs for each group on server start
    }
}
