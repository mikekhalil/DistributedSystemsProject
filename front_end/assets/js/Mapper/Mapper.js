/* test
var records = [ {"key":"0", "value":"Paul"}, {"key":"1", "value":"Alex"}, {"key":"2", "value":"Paul"}, {"key":"3", "value":"Dave"} ];
*/


function wordCount( key, value ) {
    var list = [];
    var split = value.split(" ");
	for(var i in split) {
		var word = split[i];
		list.push({key : word, value : 1});
	}
    return list;
}


function Mapper( mapFunc ) {
    var shuffledList = new Array(); /* shuffled and sorted list	   */
    var pairs = [];		    /* array returned from mapFunc */

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
    shuffledList.sort(function(a, b) { return a.key.localeCompare(b.key);});
    //console.log(shuffledList);
    return shuffledList;
}
