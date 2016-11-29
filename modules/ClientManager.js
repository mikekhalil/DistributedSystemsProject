
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
    isInitialized : isInitialized
}