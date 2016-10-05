var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');

//practice input before setting up the connection with the clients
var input = {
	"paul" : 3,
	"mikey" : 5,
	"sameet" : 10
}

//practice reduce function before setting up connection with clients
function reduceFunc(key, val) {
    //word count example
    var count = 0;
    for(var index in val) {
        count += val[index];
    }
    return count;
}


var closeDB = function(db) {
	console.log('closing db connection');
	db.close();
}

var MainReduction = function(db,result, redFunc, cb){
	var col = db.collection('jobs');
	Object.keys(result).forEach(function(key) {
		col.findOne({key : key},function(err,doc) {
			if(err) {
				console.log(err);
			}
			
			if(doc) {
				console.log('found doc');	
				var newVal = redFunc(key, [doc.value, result[key]]);
				col.update({key : key}, {$set : {value : newVal }});
				console.log('updated key : ' +  doc.key + ', value : '+ doc.value);
			}
			else {
				//insert key and val
				col.insertOne({"key" : key,"value" : result[key]}, function(err,result) {
					if(err){
						console.log(err);
					}
					console.log('didnt find doc, created new record');
				});
			}
		})	
	});
	cb(db);
}

socket.on('connect', function() { 
	console.log("connected!"); 	
	MongoClient.connect(config.mongodb.url, function(err, db) {
		console.log("Connected correctly to server.");
		MainReduction(db,input,reduceFunc,closeDB);
	});
}); 

messenger.inchannel.subscribe(config.topics.SYSTEM_RESET , function(msg) {
	//do stuff to reset reducer
	

}); 


messenger.inchannel.subscribe(config.topics.RESULTS, function(msg) {
	//slave node finish MapReduce job
	MongoClient.connect(config.mongodb.url, function(err, db) {
		console.log("Connected correctly to server.");
		
	});
});





