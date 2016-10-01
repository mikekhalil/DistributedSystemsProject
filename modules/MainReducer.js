// KS Mikey's Code. Will have to write a function that reads files,
// shuffles and sorts them, and pass that in as shuffledData in to this func
function MainReducer( ShuffledData, reduceFunc, outputFile ) {
    var result = {};
    var fs = require('fs');
    for(var index in ShuffledData) {
	var record = ShuffledData[index];
	var reduction = reduceFunc(record.key, record.value);
	result[record.key] = reduction;
    }

    fs.writeFile(outputFile, JSON.stringify(result), function(err) {
	if(err) {
	    return console.log(err);
	}
    }); 
}
