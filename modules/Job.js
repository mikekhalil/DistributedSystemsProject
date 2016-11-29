//require mongoose and mongodb
//require messenger

var path;
var status;
var worker;
var group;
var map;
var reduce;
var splits;
var tasks;
var id;


var setStatus = function(status) {
    this.status = status;
} 

var setFile = function(file, type) {
    this[type] = file;
    //save to database
    Jobs.findOne({name : this.name, group : group.name},function(err,doc) {
        doc[type] = file;
        doc.save();
    });
}

var start = function() {
    //set up job table
    messenger.publishTo("worker", "MapReduce", {mapper : this.map, reducer : this.reduce, job_id : this.job.id , group_id : this.group });
    messenger.publishTo("reducer", "MapReduce", {reducer : this.reduce , job_id : this.job.id, group_id : this.group });
    Object.keys(this.splits).forEach(function(key) {
            this.tasks.push(new Task(this.splits[key], config.status.INCOMPLETE));
    });
    var workers = GroupManager.getWorkers(this.group);
    console.log('number of splits ' + Object.keys(this.splits).length);
    for(var i = 0; i < workers.length; i++) {
        var worker = workers[i]; 
        var task = this.tasks[i];

        if(task != undefined) {
            task.setStatus(config.status.ACTIVE);
            var jp = new JobPacket(fs.readFileSync(task.split, "utf-8"), task.split, this.job.id, this.group);
            messenger.publishToSelectedWorkers([worker],"InputSplit", jp);
        }
    }

}

var resultHandler = function(msg) { 
    //TODO: Add a timeout featue - if job has been active for more tha X seconds, update it to not active - assign job to another node
    var sockid = msg.data.sockid;
    var completedTask = msg.data.inputSplit;
    completedTask.setStatus(config.status.COMPLETE);
    var task = this.getNextTask();
    
    if (task != null) {
        task.setStatus(config.status.ACTIVE);
        var jp = new JobPacket(fs.readFileSync(task.split, "utf-8"), task.split, this.job.id, this.group);
        messenger.publishToSelectedWorkers([sockid], "InputSplit", jp);
    }
}