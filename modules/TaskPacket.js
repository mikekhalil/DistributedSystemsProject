'use strict';
class TaskPacket{
    constructor(fileData, task,job_id, group_id) {
        this.fileData = fileData;
        this.task = task;
        this.job_id = job_id;
        this.group_id = group_id;
    }
}


module.exports = TaskPacket;
