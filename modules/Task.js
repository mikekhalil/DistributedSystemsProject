'use strict';
class Task{
    constructor(split, status){
        this.split = split;
        this.status = status;
        this.sock_id = null;
    }
    setStatus(status) {
        this.status = status;
    }
    setSockID(sock_id) {
        this.sock_id = sock_id;
    }
}

module.exports = Task;