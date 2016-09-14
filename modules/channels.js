//require stuff
var postal = require("postal");

module.exports = {
    TaskChannel : postal.channel("TaskChannel"),
    ResourceChannel : postal.channel("ResourceChannel"),
    ReduceChannel : postal.channel("ReduceChannel")
};
