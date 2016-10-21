var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');
var reducer = require(__dirname + '/modules/Reducer.js');

socket.on('connect', function() { 
	console.log("connected to socket server"); 	
}); 

messenger.inchannel.subscribe(config.topics.SYSTEM_RESET , function(msg) {
	//do stuff to reset reducer / particular collection
	

}); 


messenger.inchannel.subscribe(config.topics.RESULTS, function(msg) {
	//slave node finish MapReduce job
	MongoClient.connect(config.mongodb.url, function(err, db) {
		if(!err){
			console.log("Connected to mongodb instance");
			console.log(msg.data);
			reducer.closeConnection(db);
		}
		else {
			console.log(err);
		}
	});

	
});





