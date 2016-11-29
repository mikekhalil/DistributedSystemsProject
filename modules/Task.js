class Task{
    constructor(split, status){
        this.split = split;
        this.status = status;
    }
    setStatus(status) {
        this.status = status;
    }
}

module.exports = Task;