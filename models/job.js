var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('Job', new Schema({ 
    name: String,       //primary key
    owners: [String],   //owners
    map : String,       //map function
    reduce: String,     //reduce function
    status: String,     //queued | active | completed
    results: String,    //result data dump text file
    splits : [String],   //Path to splits,
    data: String
}));
