const config = require(__dirname + '/../config.json');
var mkdirp = require('mkdirp');
var fs = require('fs');
const path = require('path');
var jsonfile = require('jsonfile');


//TODO: use Redis Hashes!!!!

var redisReduce = function(client, job_id, group_id, results, reduceFunc, cb) { 
	var len = Object.keys(results).length;
	var count = 0;
	var hash = job_id;
	//Hash to jobid
	Object.keys(results).forEach(function(key) {
		 client.hincrby(hash,key,results[key],function(err,val){
			 console.log(key + ' : ' + val);
			 count += 1;
			 if (count == len) {
				 cb();
			 }
			
		 });
	});
}

var redisDump = function(client, job_id, group_id,dir,  cb) {
	//dump job results to text file
	var suffix = ':*';
	var hash = job_id;
	console.log('hash: ' + hash);
	client.hgetall('test', (err,res) => {
		if(err)
			cb(err,null);
		mkdirp(dir, (err) => {
			var file = dir + '/' + job_id + '-results.txt';
			jsonfile.writeFile(file, res,{spaces: 2}, (err) => {
				cb(err,{results: res, path: file});
			});
		});
	});
	
}


module.exports = {
	redisReduce: redisReduce,
	redisDump: redisDump
}