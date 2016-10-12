var sendJob = function(sockid, job) {
    //send job to client with specified socketid

}
var isInitialized = function(obj) {
    var init = true;
    Object.keys(obj).forEach(function(key) {
        if(obj[key] == null){
            init = false;
        }
    });
    return init;
}
module.exports = {
    sendJob : sendJob,
    isInitialized : isInitialized
}