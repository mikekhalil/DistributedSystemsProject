
var redisReduce = function(client, groupid, results, reduceFunc, cb) { 
	var len = Object.keys(results).length;
	var count = 0;

	Object.keys(results).forEach(function(key) {
		 var fullKey = groupid + ":" + key;
		 client.incrby(fullKey,results[key],function(err,val){
			 count += 1;
			 if (count == len) {
				 cb();
			 }
			
		 });
	});
}



module.exports = {
	redisReduce: redisReduce
}