/* Calls the mapper function on each record and the mapFunc returns a key,value pair(s).
 * Shuffles and sorts the key, value pairs
 * List returned is a JSON array in the format
 * [ {key:"key1", value:["val1", "val2", ...]}, {key:"key2", value:["val1"]}]
 * Written by Paul Heldring
 */

function Mapper( mapFunc, records ) {
    var shuffledList = new Array(); /* shuffled and sorted list	   */
    var pairs = [];		    /* array returned from mapFunc */

    // returns the index of key or -1 if key does not exist
    function indexOfVal( str ) {
	for (var i in shuffledList) {
	    if (shuffledList[i].key === str) {
		return i;
	    }
	}
	return -1;
    }

    for (var i in records) {
	// call map function
	pairs =  mapFunc( records[i].key, records[i].value );
	for (var j in pairs) {
	    var index = indexOfVal(pairs[j].key);
	    if ( index == -1 ) {
		// key doesn't exit, create an array and append value to array
		var tmp = pairs[j].value;
		pairs[j].value = new Array();
		pairs[j].value.push(tmp);
		shuffledList.push(pairs[j]);
	    } else {
		// key exists, append value to array
		shuffledList[index].value.push(pairs[j].value);
	    }
	}
    }
    shuffledList.sort(function(a, b) { return a.key.localeCompare(b.key); });
    return shuffledList;
}
