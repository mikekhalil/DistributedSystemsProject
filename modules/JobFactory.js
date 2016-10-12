var createJob = function(path, status) { 
    var job = {};
    job['path'] = path;
    job['status'] = status; 
    job['worker'] = null;
    return job;
}
module.exports = {
    createJob : createJob
}