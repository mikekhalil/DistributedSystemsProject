var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "manager");
var fs = require('fs');
var config = require('./config.json');
var splitter = require(__dirname + '/modules/SplitInput.js');
const path = require('path');
const resourceManager = require(__dirname + '/modules/ClientManager.js');
const JobManager = require(__dirname + '/modules/JobFactory.js');


var mongoose    = require('mongoose');
var Group = require(__dirname + '/models/group');
var JobSchema = require(__dirname + '/models/job.js');
var Job = (__dirname + '/modules/Job');


mongoose.connect(config.mongodb.url);



socket.on('UploadedFile', function(files) {
    console.log(files);

    JobSchema.findOne({name : files.job_id}, function(err,doc) {
        if(err) 
            throw err;
        
        fs.readFile(files.map,'utf8', (err, mapData) => {
            if(err) 
                throw err;
            fs.readFile(files.reduce,'utf8', (err,redData) => {
                if(err)
                    throw err;
                
                const groupDir = path.join(__dirname, config.multer.path, files.group_id);
                splitter.splitInput(files.data, groupDir, files.job_id, (inputSplits) => {
                    doc.map = mapData;
                    doc.reduce = redData;
                    doc.data = files.data;
                    let index = 0;
                    Object.keys(inputSplits).forEach((key) => {
                        doc.splits.set(index++, inputSplits[key]);
                    });
                    doc.save((err,doc) => {
                        if(err)
                            throw err;
                        console.log(doc);
                    });
                });




                // doc['map'] = mapData;
                // doc['reduce'] = redData;
                // doc['data'] = 
                
            });
        });
    });



    //les
    // //update the particular job
    // JobSchema.findOne({name: file.job_id}, function(err,doc) {
    //     if(err)
    //         throw err;
        
    //         var fileData = fs.readFileSync(file.data, "utf8");
    //         doc[file.type] = fileData;
    //         console.log('map or reduce');
    //         doc.save(function(err,doc) { 
    //             if(hacky[file.job_id]){
    //                 hacky[file.job_id]++;
    //                 if(isInitialized(file.job_id)){
    //                     createJob(file.job_id);
    //                 }
    //             }
    //             else{
    //                 hacky[file.job_id] = 1;
    //             }
    //         });
    //     }
    //     else {
    //         //Data file, Create Input Splits
    //         var groupDir = path.join(__dirname,config.multer.path,file.group_id);
    //         splitter.splitInput(file.data,groupDir,file.job_id,function(inputSplits) {
    //             doc.data = file.data;
    //             var index = 0;
    //             Object.keys(inputSplits).forEach(function(key){
    //                 doc.splits.set(index++, inputSplits[key]);
    //             });
    //             doc.save(function(err,doc) {
    //                     if(hacky[file.job_id]){
    //                     hacky[file.job_id]++;
    //                     if(isInitialized(file.job_id)){
    //                         getJob(file.job_id);
    //                     }
    //                 }
    //                 else{
    //                     hacky[file.job_id] = 0;
    //                 }
    //             });
    //             //console.log('splits + data');
    //             //console.log('is initalized : ' + isInitialized(doc));
    //         });
    //     }
    // });


 
});

messenger.inchannel.subscribe("SystemReset" , function(msg) {
	
}); 

messenger.inchannel.subscribe("Results", function(msg) {
    console.log(msg.data);
});

messenger.inchannel.subscribe(config.topics.CLIENT_TABLE_UPDATE, function(msg) {
    //TODO HOW DO WE UPDATE GroupManager here
});