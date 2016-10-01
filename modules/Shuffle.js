/* Functions takes an array of filepaths as input 
 * Reads each file in, converts text data to JSON
 * Shuffles and sorts each key, value pair
 * Written by Paul Heldring
 */
var func = function MainShuffle( reducedFiles ) {
    var fs = require('fs');
    var encoding = 'utf8';
    var shuffledData = {};
    var orderedData = {};

    for ( i in reducedFiles ) {
	var filePath = reducedFiles[i];
	var data = fs.readFileSync(filePath, encoding);
	var keyVal = JSON.parse(data);
	for ( key in keyVal ) {
	    if ( shuffledData.hasOwnProperty(key) ) {
		// key exists, append value to array
		shuffledData[key].push(keyVal[key]);
	    } else {
		// key does not exist, create k,v pair
		var val = [];
		val.push(keyVal[key]);
		shuffledData[key] = val;
	    }
	}
    }
    // Sort keys, kind of inefficient because read data is already sorted
    Object.keys(shuffledData).sort().forEach(function(key) {
	  orderedData[key] = shuffledData[key];
    });
    return orderedData;
}

module.exports = {
    mainShuffle : func
}
