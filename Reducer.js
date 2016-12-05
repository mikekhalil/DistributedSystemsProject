var socket = require('socket.io-client')('http://localhost:8080'); 
var messenger = require(__dirname + '/modules/messenger.js')(socket, "reducer"); 
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.json');
var reducer = require(__dirname + '/modules/Reducer.js');
const path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient(6379,"198.199.123.85"); //creates a new client


//TODO (jobid and groupid will need to be in packet data now) as well as count + length
var JobTracker = {
	test  : {
		count: 0,
		length: 127
	}
};

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

messenger.inchannel.subscribe("MapReduce", function(msg) {
    reduceFunc = new Function('key','value',msg.data.reducer);
});


messenger.inchannel.subscribe(config.topics.RESULTS, function(msg) {
		var job_id = 'test';
		var group_id = 'another test';
		reducer.redisReduce(RedisClient,job_id,group_id, msg.data, reduceFunc, function() {
			JobTracker[job_id].count += 1;
			console.log('count: ' + JobTracker[job_id].count);
			if(JobTracker[job_id].count === JobTracker[job_id].length) {
			 	console.log('completed entire job');
			 	//TODO : Clean Up Redis Hash for particular job ID
				var dir = path.join(__dirname, config.multer.path, group_id, job_id);
				reducer.redisDump(RedisClient,job_id, group_id, dir, (err,res)=>{
					console.log(res.path);
				});
			}
		});
});





