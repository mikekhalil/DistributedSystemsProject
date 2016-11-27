var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('Job', new Schema({ 
    users: [String],
    jobs: [String],
    name: String,
    admins: [String]
}));
