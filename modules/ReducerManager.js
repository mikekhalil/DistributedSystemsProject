'use strict'; 
class ReducerManager {
    constructor(Group) {
         this.jobs = {}
         var that = this;
         Group.find({}, function(err,groups) {
            if(err)
                throw err;
          
            for(var group of groups) {
                that.jobs[group.name] = {};
            }
              that.dump();
        });
      
    }
    registerJob(job) {
        job.count = 0;
        this.jobs[job.group_id][job.job_id] = job;
        this.dump();
    }
    getJob(group_id,job_id) {
        if(this.jobExists(group_id,job_id))
            return this.jobs[group_id][job_id];
    }
    incrementCount(group_id, job_id) {
        this.jobs[group_id][job_id].count += 1;
    }
    getCount(group_id, job_id) {
        return this.jobs[group_id][job_id].count;
    }
    deleteJob(group_id, job_id) {
        var group = this.jobs[group_id];
        delete group[job_id];
    }
    jobExists(group_id,job_id){
        return this.jobs[group_id] && this.jobs[group_id][job_id] != null;
    }
    isComplete(group_id, job_id) {
        return this.jobs[group_id][job_id].count == this.jobs[group_id][job_id].length;
    }
    resultHandler(){

    }
    registerGroup(group_id) {
        this.jobs[group_id] = {};
        this.dump();
    }
    dump() { 
        console.log(this);
    }
}

module.exports = ReducerManager;