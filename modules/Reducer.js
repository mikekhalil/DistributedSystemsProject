const config = require(__dirname + '/../config.json');
var mkdirp = require('mkdirp');
var fs = require('fs');
const path = require('path');
var jsonfile = require('jsonfile');
var AWS = require('aws-sdk');

//configure aws
AWS.config.update(config.aws_config);


var dropIntoBucket = function(data, file,cb) {
	var s3 = new AWS.S3();
	var params = {
		Bucket : config.aws.bucket,
		Key : file,
		Body: data,
		ACL: 'public-read'
	};
	s3.putObject(params, (err,data) => {
		if(err){
			cb(err,null);
			return;
		}
		console.log('uploaded successfully');
		cb(null, config.aws.endpoint + file);
	});
}

var redisReduce = function(client, job_id, group_id, results, reduceFunc, cb) { 
	var len = Object.keys(results).length;
	var count = 0;
	var hash = job_id;
	//Hash to jobid
	Object.keys(results).forEach(function(key) {
		 client.hincrby(hash,key,results[key],function(err,val){
			 count += 1;
			 if (count == len) {
				 cb();
			 }
			
		 });
	});
}

var redisDump = function(client, job_id, group_id,dir,  cb) {
	//dump job results to s3 bucket
	var suffix = ':*';
	var hash = job_id;
	client.hgetall(hash, (err,res) => {
		if(err)
			cb(err,null);	
		dropIntoBucket(JSON.stringify(res,null,3),job_id + '-results.txt',(err,res) => {
			cb(err,res);
		});
	});
	
}


module.exports = {
	redisReduce: redisReduce,
	redisDump: redisDump
}