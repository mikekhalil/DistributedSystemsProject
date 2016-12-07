var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');
var reducer = require(__dirname + '/modules/Reducer.js');
const path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient(6379,"198.199.123.85"); //creates a new client
var ReducerManager = require(__dirname + '/modules/ReducerManager.js');
var mongoose    = require('mongoose');
var Group = require(__dirname + '/models/group.js');
var Job = require(__dirname + '/models/job.js');
mongoose.connect(config.mongodb.url);7

var rm = new ReducerManager(Group);




RedisClient.on('connect', function() {
	RedisClient.auth(config.redis.password, function(err) {
		console.log('connected to Redis');
		RedisClient.flushdb(function(err,suc) {
			if(err)
				console.log(err);
			console.log('cleared Redis');
		});
		
	});
});

RedisClient.on('error', function(err) {
	console.log(err);
});

socket.on("RegisterGroup", (group) => {
	rm.registerGroup(group.name)
});



messenger.inchannel.subscribe("MapReduce", function(msg) {
	console.log(msg);
	var job = msg.data;
	rm.registerJob(job);
});

messenger.inchannel.subscribe("RegisterGroup", function(msg) { 
	console.log(msg.data);
});


messenger.inchannel.subscribe(config.topics.RESULTS, function(msg) {
		var data = msg.data.data;
		var group_id = msg.data.group_id;
		var job_id = msg.data.job_id;
		var reduceFunc = rm.getJob(group_id, job_id).reducer;
		reducer.redisReduce(RedisClient,job_id,group_id, data, reduceFunc, function() {
			rm.incrementCount(group_id,job_id);
			console.log(job_id + " : " + rm.getJob(group_id,job_id).count); 
			
			if(rm.isComplete(group_id,job_id)) {
			 	console.log('completed entire job');
			 	//TODO : Clean Up Redis Hash for particular job ID
				var dir = path.join(__dirname, config.multer.path, group_id, job_id);
				reducer.redisDump(RedisClient,job_id, group_id, dir, (err,res)=>{
					if(err)
						console.log(err);
					console.log(res);
				});
			}
		});
});





