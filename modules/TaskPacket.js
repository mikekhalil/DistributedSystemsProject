'use strict';
class TaskPacket{
    constructor(fileData, inputSplit,job_id, group_id) {
        this.fileData = fileData;
        this.inputSplit = inputSplit;
        this.job_id = job_id;
        this.group_id = group_id;
    }
}


modules.export = TaskPacket;
