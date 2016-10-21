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

var closeDB = function(db) {
	console.log('closing db connection');
	db.close();
}



module.exports = {
    reduce : MainReduction,
    closeConnection : closeDB
}