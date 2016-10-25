var MainReduction = function(db,collection,result, redFunc,cb){
	var col = db.collection(collection);
	console.log('started reducing');
    Object.keys(result).forEach(function(key) {

		col.insert({_id:key}, {'value': result[key]}, function(err, doc){
			if(err) {
				col.update({_id:key}, {$inc: {'value':result[key]}});
			}
		});
	

	});
}

var clearCollection = function(db, col, cb) {
    var collection = db.collection(col);
    collection.remove();
    //db.close();
    
}

var closeDB = function(db) {
	console.log('closing db connection');
	//db.close();
}



module.exports = {
    reduce : MainReduction,
    closeConnection : closeDB,
    clearCollection : clearCollection
}