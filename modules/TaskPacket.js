'use strict';
class TaskPacket{
    constructor(fileData, task,job_id, group_id,count) {
        this.fileData = fileData;
        this.task = task;
        this.job_id = job_id;
        this.group_id = group_id;
        this.count = count;
    }
}


module.exports = TaskPacket;
