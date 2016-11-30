class GroupManager {
    constructor(/*db*/){
        this.jobs = {};
        this.users = {};

        // db.jobs.find({}, function(err,groups) {
        //     if(err)
        //         throw err;
        //     console.log(groups);
        // });
    }

    registerUser(user) {
        for(var group of user.group_ids)
            this.users[group].push(user);
    }

    removeUser(sock_id) {
        Object.keys(this.users).forEach(function(key) {
            var users = this.users[key]
            for (var user in users) {
                if (users[user].sock_id == sock_id) {
                   this.users[key].splice(user, 1); 
                }
            }
            
        });
    }
    

    registerGroup(group) {
        this.jobs[group.name] = group.jobs;
        this.users[group.name] = group.users;
    }

    registerJob(job, group_id) {
        if(this.jobs[group_id].length == 0)
            job.start();
        this.jobs[group_id].push(job);
    }

    getJobs(group_id) {
        return this.jobs[group_id];
    }

    getusers(group_id) {
        return this.users[group_id];
    }

    finishedJob(group_id) {
        var job = this.jobs[group_id].shift(); //equivalent to dequeue
        //check to see if another job is in the queue

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

}

module.exports = GroupManager; 