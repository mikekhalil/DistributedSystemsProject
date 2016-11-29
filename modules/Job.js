//require messenger

//TODO: Save job to database / do inputsplit / create tasks before the Job object is created

//TODO: to make this a lot faster, keep track of current index of first non-complete job
var TaskPacket = require('./TaskPacket.js');
var InitialPacket = require('./InitialPacket.js');
var config = require(__dirname + '/../config.json');

class Job {
    constructor(id, path, status, map, reduce,splits, group, messenger,GroupManager) {
        this.id = id;
        this.path = path;
        this.status = status;
        this.map = map;
        this.reduce = reduce;
        this.splits = splits;
        this.group = group;
        this.messenger = messenger;
        this.GroupManager = GroupManager;
        this.tasks = [];
    }
    setStatus(status) {
        this.status = status;
    }
    start() {
        this.setUpJob();
        var workers = this.GroupManager.getWorkers(this.group);
        this.printNumberOfTasks();
        for(var worker of workers){
            task = this.getNextTask();
            if(task != undefined) {
                task.setStatus(config.status.ACTIVE);
                var packet = new TaskPacket(fs.readFileSync(task.split, "utf-8"), task.split, this.id, this.group);
                this.messenger.publishToSelectedWorkers([worker],"InputSplit", jp);
            }
        }

    }
    setUpJob(){
        var packet = new InitialPacket(this.map,this.reduce,this.id,this.group);
        this.messenger.publishTo("worker", "MapReduce", packet);
        this.messenger.publishTo("reducer", "MapReduce", packet);
         Object.keys(this.splits).forEach(function(key) {
            this.tasks.push(new Task(this.splits[key], config.status.INCOMPLETE));
        });
    }
    printNumberOfTasks() {
        console.log('number of tasks: ' + this.tasks.length);
    }
    resultHandler() {
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
    getNextTask(){
        for(var cur of this.tasks) {
            if(cur.status == config.status.INCOMPLETE) 
                return cur;
        }
        return null;
    }
    isComplete() {
        return getNextTask() != null;
    }
}
module.exports = Job;