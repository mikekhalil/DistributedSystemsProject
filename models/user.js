var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({ 
    data : {
        email: String,
        name: String,
        groups: [String]
    },
    pw: String 
}));