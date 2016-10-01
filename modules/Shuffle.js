/* Functions takes an array of filepaths as input 
 * Reads each file in, converts text data to JSON
 * Shuffles and sorts each key, value pair
 * Written by Paul Heldring
 */
function MainShuffle( reducedFiles ) {
    var fs = require('fs');
    var encoding = 'utf8';
    var shuffledData = {};

    for ( i in reducedFiles ) {
	var filePath = reducedFiles[i];
	var data = fs.readFileSync(filePath, encoding) 
	var keyVal = JSON.parse(data);
	for ( key in keyVal ) {
	    if ( shuffledData.hasOwnProperty(key) ) {
		shuffledData[key].push(keyVal[key]);
	    } else {
		var val = [];
		val.push(keyVal[key]);
		shuffledData[key] = val;
	    }
	}
    }
    // still need to sort keys... have to find a good way to do this
    return shuffledData;
}
