var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');
var reducer = require(__dirname + '/modules/Reducer.js');


reduceFunc = null;
socket.on('connect', function() { 
	console.log("connected to socket server");
	MongoClient.connect(config.mongodb.url, function(err,db) {
		if(!err) {
			console.log("clearing mongo collection");
			reducer.clearCollection(db,"jobs", reducer.closeConnection);
			console.log('cleared collection');
		}
		else{
			console.log(err);
			reducer.closeConnection(db);
		}
		
	});	
}); 

messenger.inchannel.subscribe(config.topics.SYSTEM_RESET , function(msg) {
	//do stuff to reset reducer / particular collection
	

}); 

messenger.inchannel.subscribe("MapReduce", function(msg) {
    reduceFunc = new Function('key','value',msg.data.reducer);
});


messenger.inchannel.subscribe(config.topics.RESULTS, function(msg) {
	//slave node finish MapReduce job
	console.log("got results from nodes"); 
	MongoClient.connect(config.mongodb.url, function(err, db) {
		if(!err){
			console.log("Got Results - Storing in mongodb");
			reducer.reduce(db,"jobs", msg.data, reduceFunc, reducer.closeConnection);
		}
		else {
			console.log(err);
			reducer.closeConnection(db);
		}
		
	});

	
});





