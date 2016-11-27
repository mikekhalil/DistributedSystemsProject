var MainReduction = function(db,collection,result, redFunc,cb){
	var col = db.collection(collection);
	//console.log('started reducing');
	var bulk = null;
    Object.keys(result).forEach(function(key) {
		col.findOne({_id : key }, function(err,doc) {
			if(doc && doc.value){
					console.log(doc);
					col.updateOne({_id : key}, {$set: {value : reduceFunc([value[key], doc['value']])}});
			}
			else {
				console.log('inserting key : ' + key);
				if(!bulk)
					bulk = col.initializeUnorderedBulkOp();
				
				bulk.insert({_id : key, value : result[key]});
			}
		});
		
	});
	if(bulk) {
		bulk.execute(function(err,results) {
			console.log('execued bulk operations');
			if(db)
				db.close();
		});
	}
}

var clearCollection = function(db, col, cb) {
    var collection = db.collection(col);
    collection.remove();
    db.close();
}

var closeDB = function(db) {
	//console.log('closing db connection');
	if(db)
		db.close();
}


var redisReduce = function(client, groupid, results, reduceFunc) { 
	console.log('processing results');
	Object.keys(results).forEach(function(key) {
		 var fullKey = groupid + ":" + key;
		 client.incrby(fullKey,results[key],function(err,val){
			 console.log('SET ' + fullKey + " , " + val);
		 });
	});
}



module.exports = {
    reduce : MainReduction,
    closeConnection : closeDB,
    clearCollection : clearCollection,
	redisReduce: redisReduce
}