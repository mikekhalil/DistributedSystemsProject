'use strict';
class InitialPacket{
    constructor(mapper, reducer, job_id, group_id, length) {
        this.mapper = mapper;
        this.reducer = reducer;
        this.job_id = job_id;
        this.group_id = group_id;
        this.length = length;
    }
}

module.exports = InitialPacket;