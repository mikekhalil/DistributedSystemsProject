var config = require(__dirname + '/../config.json');

var createJob = function(path, status) { 
    var job = {};
    job['path'] = path;
    job['status'] = status; 
    job['worker'] = null;
    return job;
}

var setJobStatus = function(jobs,path,status) {
    for(var i = 0; i < jobs.length; i++) {
        cur = jobs[i];
        if(cur.path === path) {
            if(status == config.status.ACTIVE) {
                //console.log('setting : ' + path + ' to Active');
            }
            jobs[i].status = status;
            break;
        }
    }
}

var getNextJob = function(jobs) {
    for(var i = 0; i < jobs.length; i++) {
        cur = jobs[i];
        if(cur.status == config.status.INCOMPLETE) {
            return cur;
        }
    }
    //no more jobs
    return null;
}
module.exports = {
    createJob : createJob,
    setJobStatus : setJobStatus,
    getNextJob : getNextJob
}